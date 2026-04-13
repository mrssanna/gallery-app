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
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { CustomErrors } from '../common-files/constants/custom-errors';
import {
  MAX_FILE_SIZE_MB,
  BITES_IN_MB,
  ALLOWED_MIMETYPE_REGEXP,
} from '../common-files/constants/constants';

@SkipThrottle()
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get profile', tags: ['Profile'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetProfileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  getProfile(@User('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update profile', tags: ['Profile'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetProfileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @User('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile({
      ...{ id: userId },
      ...updateProfileDto,
    });
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Upload user avatar', tags: ['Profile'] })
  @ApiConsumes('multipart/form-data')
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @User('sub') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE_MB * BITES_IN_MB,
            message: CustomErrors.FILE_SIZE_LIMIT,
          }),
          new FileTypeValidator({ fileType: ALLOWED_MIMETYPE_REGEXP }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }

  // ======================================== Admin endpoints =====================================
  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all users', tags: ['Admin'] })
  @ApiResponse({ status: HttpStatus.OK, type: GetAllUsersResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @UseInterceptors(ClassSerializerInterceptor)
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

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get user by login', tags: ['Admin'] })
  @ApiResponse({ status: HttpStatus.OK, type: GetUserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':login')
  @UsePipes(new ValidationPipe({ transform: true }))
  findOneByLogin(@Param() params: UserLoginDto) {
    return this.usersService.findOneByLogin(params);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update user by admin', tags: ['Admin'] })
  @ApiResponse({ status: HttpStatus.OK })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':login')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateUserByAdmin(
    @Param() params: UserLoginDto,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateUserByAdmin(params.login, dto);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Block/unblock user by login', tags: ['Admin'] })
  @ApiResponse({ status: HttpStatus.OK, type: BlockUserResponseDto })
  @Post('block')
  blockUser(@Body() body: UserLoginDto) {
    return this.usersService.blockUser(body);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Remove user by login', tags: ['Admin'] })
  @ApiResponse({ status: HttpStatus.OK, type: RemoveUserResponseDto })
  @Delete(':login')
  remove(@Param() params: UserLoginDto) {
    return this.usersService.remove(params);
  }
}
