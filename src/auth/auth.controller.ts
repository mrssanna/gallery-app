import {
  Controller,
  Post,
  Body,
  Request,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthGuard } from '../common-files/guards/auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpResponseDto } from './dto/signup-response.dto';
import { getUserId } from '../common-files/helpers';
import { IUserRequest } from '../interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipThrottle()
  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: SignUpResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too Many Request',
  })
  @Post('login')
  create(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  @SkipThrottle()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiOperation({ summary: 'Refresh tokens' })
  @Post('refresh')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  logOut(@Request() req) {
    // eslint-disable-next-line
    const userId = getUserId((req?.user as IUserRequest) || undefined); // req.user.sub;
    return this.authService.logOut(userId);
  }
}
