import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor, // Serialization is a process that happens before objects are returned in a network response
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { AuthGuard } from '../common-files/guards/auth.guard';
import { RolesGuard } from '../common-files/guards/roles.guard';
import { Roles } from '../common-files/decorators/roles.decorator';
import { GetUserResponseDto } from './dto/get-user-response.dto';
import { RemoveUserResponseDto } from './dto/remove-user-response.dto';
import { UserLoginDto } from '../common-files/dto/user-fields.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RoleType } from '../interfaces';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { GetAllUsersResponseDto } from './dto/get-all-users-response.dto';
import { BlockUserResponseDto } from './dto/block-user-response.dto';
import { User } from '../common-files/decorators/user.decorator';

@SkipThrottle()
@ApiBearerAuth()
@Controller('users')
// @ApiTags('Users (all)')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  // @ApiTags('Profile')
  @ApiOperation({
    summary: 'Get profile',
    tags: ['Profile'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetProfileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseInterceptors(ClassSerializerInterceptor) // remove excluded columns from response User item
  @Get('profile')
  getProfile(@User('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @UseGuards(AuthGuard)
  // @ApiTags('Profile')
  @ApiOperation({
    summary: 'Update profile',
    tags: ['Profile'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetProfileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseInterceptors(ClassSerializerInterceptor) // remove excluded columns from response User item
  @Patch('profile')
  @UsePipes(new ValidationPipe({ transform: true })) // Включаем валидацию и трансформацию DTO
  update(
    @User('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile({
      ...{ id: userId },
      ...updateProfileDto,
    });
  }

  // ======================================== Admin endpoints =====================================
  @Roles(RoleType.ADMIN) // set metadata
  @UseGuards(AuthGuard, RolesGuard) // use guards
  // @ApiTags('Users (only for development and testing)')
  @ApiOperation({ summary: 'Get all users', tags: ['Admin'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetAllUsersResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @UseInterceptors(ClassSerializerInterceptor) // remove excluded columns from response User item
  @Get()
  findAll(
    @User('sub') userId: string,
    @Query() getAllUsersDto: GetAllUsersDto,
  ) {
    return this.usersService.findAll({
      ...{ id: userId },
      ...getAllUsersDto,
    });
  }

  @Roles(RoleType.ADMIN) // set metadata
  @UseGuards(AuthGuard, RolesGuard) // use guards
  // @ApiTags('Users (only for development and testing)')
  @ApiOperation({
    summary: 'Get user by login',
    tags: ['Admin'],
  })
  @ApiParam({
    name: 'login',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetUserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @UseInterceptors(ClassSerializerInterceptor) // remove excluded columns from response User item
  @Get(':login')
  @UsePipes(new ValidationPipe({ transform: true })) // Включаем валидацию и трансформацию DTO
  findOneByLogin(@Param() params: UserLoginDto) {
    return this.usersService.findOneByLogin(params);
  }

  @Roles(RoleType.ADMIN) // set metadata
  @UseGuards(AuthGuard, RolesGuard) // use guards
  @ApiOperation({
    summary: 'Block/unblock user by login',
    tags: ['Admin'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BlockUserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @Post('block')
  blockUser(@Body() body: UserLoginDto) {
    return this.usersService.blockUser(body);
  }

  @Roles(RoleType.ADMIN) // set metadata
  @UseGuards(AuthGuard, RolesGuard) // use guards
  // @ApiTags('Users (only for development and testing)')
  @ApiOperation({
    summary: 'Remove user by login',
    tags: ['Admin'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: RemoveUserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @Delete(':login')
  remove(@Param() params: UserLoginDto) {
    return this.usersService.remove(params);
  }
}
