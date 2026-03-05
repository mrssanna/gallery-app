import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { BadRequestException } from '@nestjs/common';
import * as helpers from '../common-files/helpers';
import { RoleType } from '../interfaces';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    createUser: jest.fn(),
    getUser: jest.fn(),
    saveRefreshToken: jest.fn(),
    findRefreshTokenByUserId: jest.fn(),
    inactivateRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    jwtOptions: {
      jwtAccessTokenSecret: 'access-secret',
      jwtAccessTokenExpTime: '15m',
      jwtRefreshTokenSecret: 'refresh-secret',
      jwtRefreshTokenExpTime: '7d',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: ConfigService,
          useValue: mockConfigService as unknown as ConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const signUpDto = { login: 'test@example.com', password: 'Password123!' };
      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: '1',
        login: signUpDto.login,
        role: RoleType.USER,
      };

      jest.spyOn(helpers, 'generateHash').mockResolvedValue(hashedPassword);
      mockUsersService.createUser.mockResolvedValue(createdUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');

      const result = await service.signUp(signUpDto);

      expect(helpers.generateHash).toHaveBeenCalledWith(signUpDto.password);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        signUpDto.login,
        hashedPassword,
      );
      expect(mockUsersService.saveRefreshToken).toHaveBeenCalledWith(
        createdUser.id,
        'refreshToken',
      );
      expect(result).toEqual({
        success: true,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const loginDto = { login: 'test@example.com', password: 'Password123!' };
      const user = {
        id: '1',
        login: loginDto.login,
        password: 'hashedPassword',
        role: RoleType.USER,
      };

      mockUsersService.getUser.mockResolvedValue(user);
      jest.spyOn(helpers, 'compareHash').mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');

      const result = await service.signIn(loginDto);

      expect(mockUsersService.getUser).toHaveBeenCalledWith(loginDto.login);
      expect(helpers.compareHash).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(mockUsersService.saveRefreshToken).toHaveBeenCalledWith(
        user.id,
        'refreshToken',
      );
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw BadRequestException for invalid credentials (user not found)', async () => {
      const loginDto = { login: 'test@example.com', password: 'Password123!' };
      mockUsersService.getUser.mockResolvedValue(null);

      await expect(service.signIn(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid credentials (wrong password)', async () => {
      const loginDto = { login: 'test@example.com', password: 'Password123!' };
      const user = {
        id: '1',
        login: loginDto.login,
        password: 'hashedPassword',
        role: RoleType.USER,
      };

      mockUsersService.getUser.mockResolvedValue(user);
      jest.spyOn(helpers, 'compareHash').mockResolvedValue(false);

      await expect(service.signIn(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
