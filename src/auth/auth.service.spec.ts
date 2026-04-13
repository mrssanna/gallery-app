import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as helpers from '../common-files/helpers';
import { RoleType } from '../interfaces';
import { CustomErrors } from '../common-files/constants/custom-errors';

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

    it('should throw BadRequestException if user not found', async () => {
      const loginDto = { login: 'test@example.com', password: 'Password123!' };
      mockUsersService.getUser.mockResolvedValue(null);

      await expect(service.signIn(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signIn(loginDto)).rejects.toThrow(
        CustomErrors.INVALID_LOGIN_OR_PASSWORD,
      );
    });

    it('should throw BadRequestException if password is wrong', async () => {
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

  describe('refreshTokens', () => {
    it('should successfully refresh tokens', async () => {
      const payload = {
        sub: '1',
        login: 'test@example.com',
        role: RoleType.USER,
      };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUsersService.findRefreshTokenByUserId.mockResolvedValue(
        'oldRefreshToken',
      );
      mockJwtService.signAsync
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');

      const result = await service.refreshTokens({
        refreshToken: 'oldRefreshToken',
      });

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'oldRefreshToken',
        expect.any(Object),
      );
      expect(mockUsersService.findRefreshTokenByUserId).toHaveBeenCalledWith(
        payload.sub,
      );
      expect(mockUsersService.saveRefreshToken).toHaveBeenCalledWith(
        payload.sub,
        'newRefreshToken',
      );
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      await expect(
        service.refreshTokens({ refreshToken: 'invalid' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is revoked (not in DB)', async () => {
      const payload = {
        sub: '1',
        login: 'test@example.com',
        role: RoleType.USER,
      };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUsersService.findRefreshTokenByUserId.mockResolvedValue(''); // Token not found in DB

      await expect(
        service.refreshTokens({ refreshToken: 'oldRefreshToken' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logOut', () => {
    it('should successfully log out a user', async () => {
      mockUsersService.inactivateRefreshToken.mockResolvedValue(null);
      const result = await service.logOut('1');
      expect(mockUsersService.inactivateRefreshToken).toHaveBeenCalledWith('1');
      expect(result).toEqual({ success: true });
    });
  });
});
