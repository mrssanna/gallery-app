import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsOrder } from 'typeorm';
import { User } from './entities/user.entity';
import { RemoveUserResponseDto } from './dto/remove-user-response.dto';
import { UserLoginDto } from '../common-files/dto/user-fields.dto';
import { UpdateProfileWithIdDto } from './dto/update-profile.dto';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { GetAllUsersResponseDto } from './dto/get-all-users-response.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async createUser(login: string, password: string): Promise<User | null> {
    this.logger.debug(`Checking if user exists: ${login}`);
    const isAlreadyExist = await this.usersRepository.exists({
      where: { login },
    });

    if (isAlreadyExist) {
      this.logger.warn(`Failed to create user: ${login} already exists`);
      throw new BadRequestException(CustomErrors.USER_ALREADY_EXISTS);
    }

    const user = this.usersRepository.create({
      login,
      password,
    });

    await this.usersRepository.save(user);
    this.logger.log(`User created in DB: ${login} (ID: ${user.id})`);

    return user;
  }

  async getProfile(userId: string): Promise<User | null> {
    this.logger.debug(`Fetching profile for user ID: ${userId}`);
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      this.logger.warn(`Profile not found for user ID: ${userId}`);
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    return user;
  }

  async updateProfile(_dto: UpdateProfileWithIdDto): Promise<User | null> {
    const updateProfileDto = new UpdateProfileWithIdDto(_dto);
    const { id } = updateProfileDto;

    this.logger.debug(`Updating profile for user ID: ${id}`);
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      this.logger.warn(`Failed to update profile: User not found (ID: ${id})`);
      throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    }

    Object.keys(updateProfileDto).forEach((key) => {
      // eslint-disable-next-line
      user[key] = updateProfileDto[key];
    });

    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(`Profile updated for user ID: ${id}`);
    return updatedUser;
  }

  async findAll(dto: GetAllUsersDto): Promise<GetAllUsersResponseDto> {
    const { pageNo, perPage, role, sortField, sortOrder } = dto;
    const skip = (pageNo - 1) * perPage;

    this.logger.debug(
      `Fetching all users. Page: ${pageNo}, PerPage: ${perPage}, Role: ${role}`,
    );

    const orderOptions: FindOptionsOrder<User> = {};
    if (sortField && sortOrder) {
      orderOptions[sortField] = sortOrder;
    }

    const requestOptions: FindManyOptions<User> = {
      where: {
        ...(role ? { role } : {}),
      },
      ...(perPage && pageNo ? { skip, take: perPage } : {}),
      ...(sortField && sortOrder ? { order: orderOptions } : {}),
    };

    const [users, count] =
      await this.usersRepository.findAndCount(requestOptions);

    this.logger.log(`Found ${count} users matching criteria`);

    return {
      node: users,
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
    this.logger.debug(`Fetching user by login: ${login}`);
    const user = await this.usersRepository.findOneBy({ login });

    if (!user) {
      this.logger.warn(`User not found by login: ${login}`);
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    return user;
  }

  async remove(
    userLoginDto: UserLoginDto,
  ): Promise<RemoveUserResponseDto | null> {
    const { login } = userLoginDto;
    this.logger.log(`Attempting to remove user: ${login}`);

    try {
      await this.usersRepository.delete({ login });
      this.logger.log(`User removed successfully: ${login}`);
    } catch (err) {
      this.logger.error(`Failed to remove user: ${login}`, err);
      throw new BadRequestException(CustomErrors.DELETE_USER_ERROR);
    }

    return {
      success: true,
    };
  }

  async blockUser(
    userLoginDto: UserLoginDto,
  ): Promise<RemoveUserResponseDto | null> {
    const { login } = userLoginDto;
    this.logger.log(`Attempting to block user: ${login}`);
    const user = await this.usersRepository.findOneBy({ login });

    if (!user) {
      this.logger.warn(`Failed to block user: User not found (${login})`);
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    user.isBlocked = true;
    await this.usersRepository.save(user);
    this.logger.log(`User blocked successfully: ${login}`);

    return {
      success: true,
    };
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

    if (!user) {
      throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    }

    user.refreshToken = refreshToken;
    return this.usersRepository.save(user);
  }

  async findRefreshTokenByUserId(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user?.refreshToken || '';
  }

  async inactivateRefreshToken(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    }

    user.refreshToken = '';
    return this.usersRepository.save(user);
  }
}
