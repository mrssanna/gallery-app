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
    const isAlreadyExist = await this.usersRepository.exists({
      where: { login },
    });

    if (isAlreadyExist) {
      throw new BadRequestException(CustomErrors.USER_ALREADY_EXISTS);
    }

    const user = this.usersRepository.create({
      login,
      password,
    });

    await this.usersRepository.save(user);

    return user;
  }

  async getProfile(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    return user;
  }

  async updateProfile(_dto: UpdateProfileWithIdDto): Promise<User | null> {
    const updateProfileDto = new UpdateProfileWithIdDto(_dto);

    const { id } = updateProfileDto;

    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    }

    Object.keys(updateProfileDto).forEach((key) => {
      // eslint-disable-next-line
      user[key] = updateProfileDto[key];
    });

    return this.usersRepository.save(user);
  }

  async findAll(dto: GetAllUsersDto): Promise<GetAllUsersResponseDto> {
    const { pageNo, perPage, role, sortField, sortOrder } = dto;
    const skip = (pageNo - 1) * perPage;

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
    const user = await this.usersRepository.findOneBy({ login });

    if (!user) {
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    return user;
  }

  async remove(
    userLoginDto: UserLoginDto,
  ): Promise<RemoveUserResponseDto | null> {
    const { login } = userLoginDto;

    try {
      await this.usersRepository.delete({ login });
    } catch (err) {
      this.logger.error(err);
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
    const user = await this.usersRepository.findOneBy({ login });

    if (!user) {
      throw new NotFoundException(CustomErrors.USER_NOT_FOUND);
    }

    user.isBlocked = true;
    await this.usersRepository.save(user);

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
