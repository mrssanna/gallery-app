import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { compareHash } from '../common-files/helpers';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpResponseDto } from './dto/signup-response.dto';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { generateHash } from '../common-files/helpers';
import { IJwtPayload, RoleType } from '../interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(_dto: SignUpDto): Promise<SignUpResponseDto> {
    const signUpDto = new SignUpDto(_dto);
    const { login, password } = signUpDto;

    const passwordHash = await generateHash(password);
    const addUserResponse = await this.usersService.createUser(
      login,
      passwordHash,
    );

    let accessToken = '';
    let refreshToken = '';

    if (addUserResponse) {
      const { accessToken: accessTokenUser, refreshToken: refreshTokenUser } =
        await this.createTokenData(
          addUserResponse?.id || '', // TODO: how to fix it?
          login,
          addUserResponse?.role,
        );
      accessToken = accessTokenUser;
      refreshToken = refreshTokenUser;
    }

    return {
      success: true,
      accessToken,
      refreshToken,
    };
  }

  async signIn(loginDto: LoginDto): Promise<LoginResponseDto | null> {
    const { login, password } = loginDto;

    const user = await this.usersService.getUser(login);

    if (!user) {
      // user not found
      throw new BadRequestException(CustomErrors.INVALID_LOGIN_OR_PASSWORD);
    }

    const isMatch = await compareHash(password, user?.password);

    if (!isMatch) {
      throw new BadRequestException(CustomErrors.INVALID_LOGIN_OR_PASSWORD);
    }

    const { accessToken, refreshToken } = await this.createTokenData(
      user.id,
      login,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    let { refreshToken } = refreshTokenDto;

    let accessToken = '';

    try {
      const payload: IJwtPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.jwtOptions.jwtRefreshTokenSecret,
        },
      );

      const currentRefreshToken =
        await this.usersService.findRefreshTokenByUserId(payload.sub);

      if (currentRefreshToken == '') {
        throw new UnauthorizedException(CustomErrors.UNAUTHORIZED);
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await this.createTokenData(payload.sub, payload.login, payload.role);

      accessToken = newAccessToken;
      refreshToken = newRefreshToken;
    } catch {
      throw new UnauthorizedException(CustomErrors.UNAUTHORIZED);
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async logOut(userId: string): Promise<LogoutResponseDto> {
    await this.usersService.inactivateRefreshToken(userId);

    return {
      success: true,
    };
  }

  // ----------------------------------------------------------------------------------------------
  async generateAccessToken(
    userId: string,
    login: string,
    role: RoleType,
  ): Promise<string> {
    const payload: IJwtPayload = { sub: userId, login, role };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.jwtOptions.jwtAccessTokenExpTime,
      secret: this.configService.jwtOptions.jwtAccessTokenSecret,
    });

    return token;
  }

  async generateRefreshToken(
    userId: string,
    login: string,
    role: RoleType,
  ): Promise<string> {
    const payload: IJwtPayload = { sub: userId, login, role };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.jwtOptions.jwtRefreshTokenExpTime,
      secret: this.configService.jwtOptions.jwtRefreshTokenSecret,
    });

    return token;
  }

  async createTokenData(
    userId: string,
    login: string,
    role: RoleType,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(userId, login, role);
    const refreshToken = await this.generateRefreshToken(userId, login, role);

    await this.usersService.saveRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
