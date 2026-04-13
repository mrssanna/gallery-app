import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsOrder } from 'typeorm';
import { User } from './entities/user.entity';
import { RemoveUserResponseDto } from './dto/remove-user-response.dto';
import { UserLoginDto } from '../common-files/dto/user-fields.dto';
import {
  UpdateProfileWithIdDto,
  UpdateProfileDto,
} from './dto/update-profile.dto';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { GetAllUsersResponseDto } from './dto/get-all-users-response.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { StoreService } from '../store/store.service';
import { FileService } from '../file/file.service';
import { BUCKET_AVATARS } from '../common-files/constants/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => StoreService))
    private storeService: StoreService,
    private fileService: FileService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  // Хелпер для добавления URL аватарки к пользователю
  private async mapUserWithAvatar(user: User): Promise<User> {
    if (user.avatar) {
      user.avatarUrl = await this.fileService.getFilePath(
        user.avatar,
        BUCKET_AVATARS,
      );

      const originalPath = user.avatar.replace(/^thumb_/, '');
      Object.assign(user, {
        originalAvatarUrl: await this.fileService.getFilePath(
          originalPath,
          BUCKET_AVATARS,
        ),
      });
    }
    return user;
  }

  async createUser(login: string, password: string): Promise<User | null> {
    this.logger.debug(`Checking if user exists: ${login}`);
    const isAlreadyExist = await this.usersRepository.exists({
      where: { login },
    });
    if (isAlreadyExist)
      throw new BadRequestException(CustomErrors.USER_ALREADY_EXISTS);

    const user = this.usersRepository.create({ login, password });
    await this.usersRepository.save(user);
    return this.mapUserWithAvatar(user);
  }

  async getProfile(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    return this.mapUserWithAvatar(user);
  }

  async updateProfile(_dto: UpdateProfileWithIdDto): Promise<User | null> {
    const updateProfileDto = new UpdateProfileWithIdDto(_dto);
    const { id } = updateProfileDto;

    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);

    Object.keys(updateProfileDto).forEach((key) => {
      // eslint-disable-next-line
      user[key] = updateProfileDto[key];
    });

    await this.usersRepository.save(user);
    return this.mapUserWithAvatar(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(CustomErrors.USER_NOT_FOUND);

    if (user.avatar) {
      try {
        const originalPath = user.avatar.replace(/^thumb_/, '');
        await this.fileService.removeFile(
          BUCKET_AVATARS,
          originalPath,
          BUCKET_AVATARS,
          user.avatar,
        );
      } catch {
        this.logger.warn(`Failed to remove old avatar for user ${userId}`);
      }
    }

    // Загружаем новую аватарку. FileService сгенерирует НОВЫЙ UUID для нее.
    const { thumbnailPath, path: originalPath } =
      await this.fileService.uploadFile(file, BUCKET_AVATARS, BUCKET_AVATARS);

    // Сохраняем НОВЫЙ путь в базу данных
    user.avatar = thumbnailPath;
    await this.usersRepository.save(user);

    return {
      success: true,
      avatarUrl: await this.fileService.getFilePath(
        thumbnailPath,
        BUCKET_AVATARS,
      ),
      originalAvatarUrl: await this.fileService.getFilePath(
        originalPath,
        BUCKET_AVATARS,
      ),
    };
  }

  async updateUserByAdmin(login: string, dto: UpdateProfileDto) {
    const user = await this.usersRepository.findOneBy({ login });
    if (!user) throw new NotFoundException(CustomErrors.USER_NOT_FOUND);

    Object.keys(dto).forEach((key) => {
      // eslint-disable-next-line
      user[key] = dto[key];
    });

    await this.usersRepository.save(user);
    return { success: true };
  }

  async findAll(dto: GetAllUsersDto): Promise<GetAllUsersResponseDto> {
    const { pageNo, perPage, role, sortField, sortOrder } = dto;
    const skip = (pageNo - 1) * perPage;

    const orderOptions: FindOptionsOrder<User> = {};
    if (sortField && sortOrder) orderOptions[sortField] = sortOrder;

    const requestOptions: FindManyOptions<User> = {
      where: { ...(role ? { role } : {}) },
      ...(perPage && pageNo ? { skip, take: perPage } : {}),
      ...(sortField && sortOrder ? { order: orderOptions } : {}),
    };

    const [users, count] =
      await this.usersRepository.findAndCount(requestOptions);

    const mappedUsers = await Promise.all(
      users.map((u) => this.mapUserWithAvatar(u)),
    );

    return {
      node: mappedUsers,
      pageInfo: {
        pageNo,
        perPage,
        totalCount: count,
        totalPageCount: perPage ? Math.ceil(count / perPage) : 1,
      },
    };
  }

  async findOneByLogin(userLoginDto: UserLoginDto): Promise<User | null> {
    const { login } = userLoginDto;
    const user = await this.usersRepository.findOneBy({ login });
    if (!user) throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    return this.mapUserWithAvatar(user);
  }

  async remove(
    userLoginDto: UserLoginDto,
  ): Promise<RemoveUserResponseDto | null> {
    const { login } = userLoginDto;
    this.logger.log(`Attempting to remove user: ${login}`);

    const user = await this.usersRepository.findOne({
      where: { login },
      relations: ['images'],
    });

    if (!user) {
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    try {
      if (user.images && user.images.length > 0) {
        this.logger.log(
          `Removing ${user.images.length} images for user ${login}`,
        );
        for (const image of user.images) {
          await this.storeService.removeFile(user.id, image.id);
        }
      }

      if (user.avatar) {
        const originalPath = user.avatar.replace(/^thumb_/, '');
        await this.fileService
          .removeFile(BUCKET_AVATARS, originalPath, BUCKET_AVATARS, user.avatar)
          .catch(() => {});
      }

      await this.usersRepository.remove(user);
      this.logger.log(`User removed successfully: ${login}`);
    } catch (err) {
      this.logger.error(`Failed to remove user: ${login}`, err);
      throw new BadRequestException(CustomErrors.DELETE_USER_ERROR);
    }
    return { success: true };
  }

  async blockUser(
    userLoginDto: UserLoginDto,
  ): Promise<RemoveUserResponseDto | null> {
    const { login } = userLoginDto;
    const user = await this.usersRepository.findOneBy({ login });

    if (!user) throw new NotFoundException(CustomErrors.USER_NOT_FOUND);

    user.isBlocked = !user.isBlocked;
    await this.usersRepository.save(user);

    return { success: true };
  }

  // ----------------------------------------------------------------------------------------------
  async getUser(login: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ login });
  }

  async saveRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    user.refreshToken = refreshToken;
    return this.usersRepository.save(user);
  }

  async findRefreshTokenByUserId(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user?.refreshToken || '';
  }

  async inactivateRefreshToken(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    user.refreshToken = '';
    return this.usersRepository.save(user);
  }
}
