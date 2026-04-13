import {
  Controller,
  Post,
  Get,
  Delete,
  HttpStatus,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoreService } from './store.service';
import { AuthGuard } from '../common-files/guards/auth.guard';
import { RolesGuard } from '../common-files/guards/roles.guard';
import { Roles } from '../common-files/decorators/roles.decorator';
import { GetImagesDto } from './dto/get-images.dto';
import { GetImagesResponseDto } from './dto/get-images-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';
import { RemoveFileDto } from './dto/remove-file.dto';
import { RemoveFileResponseDto } from './dto/remove-file-response.dto';
import { UpdateFileInfoDto } from './dto/update-file-info.dto';
import { UpdateFileInfoResponseDto } from './dto/update-file-info-response.dto';
import { PublishImageDto } from './dto/publish-image.dto';
import { GetFeedDto } from './dto/get-feed.dto';
import { CustomErrors } from '../common-files/constants/custom-errors';
import {
  MAX_FILE_SIZE_MB,
  BITES_IN_MB,
  ALLOWED_MIMETYPE_REGEXP,
} from '../common-files/constants/constants';
import { User } from '../common-files/decorators/user.decorator';
import { RoleType } from '../interfaces';
import { IdDto } from '../common-files/dto/id-field.dto';
import { SuccessResponseDto } from '../common-files/dto/success-response-field.dto';

@SkipThrottle()
@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ======================================== Public endpoints =====================================
  @ApiOperation({
    summary: 'Get public feed of published images',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetImagesResponseDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('feed')
  getFeed(@Query() getFeedDto: GetFeedDto) {
    return this.storeService.getFeed(getFeedDto);
  }

  // ======================================== Protected endpoints ==================================
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload single file',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UploadFileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @User('sub') userId: string,
    @Body() uploadFileDto: UploadFileDto,
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
    return this.storeService.uploadFile({
      ...{ id: userId },
      ...{ file },
      ...uploadFileDto,
    });
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update image info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UpdateFileInfoResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Patch('update')
  updateImageInfo(
    @User('sub') userId: string,
    @Body() updateFileInfoDto: UpdateFileInfoDto,
  ) {
    return this.storeService.updateFileInfo({
      ...{ userId },
      ...updateFileInfoDto,
    });
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish or unpublish image',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Patch('publish')
  publishImage(
    @User('sub') userId: string,
    @Body() publishImageDto: PublishImageDto,
  ) {
    return this.storeService.publishImage(userId, publishImageDto.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all images for current user with pagination and sorting',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetImagesResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('image')
  findAll(@User('sub') userId: string, @Query() getImagesDto: GetImagesDto) {
    return this.storeService.findAll({ ...{ id: userId }, ...getImagesDto });
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove image',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: RemoveFileResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  @Delete('image')
  remove(@User('sub') userId: string, @Body() removeFileDto: RemoveFileDto) {
    return this.storeService.removeFile(userId, removeFileDto.id);
  }

  // ======================================== Admin endpoints =====================================
  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all images for specific user (Admin only)',
    tags: ['Admin'],
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user whose images to fetch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetImagesResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/image/:id')
  findAllForUser(@Param() params: IdDto, @Query() getImagesDto: GetImagesDto) {
    return this.storeService.findAll({ ...{ id: params.id }, ...getImagesDto });
  }
}
