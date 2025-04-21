import {
  Controller,
  Post,
  Get,
  Delete,
  HttpStatus,
  Request,
  Body,
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
  ApiBearerAuth
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoreService } from './store.service';
import { AuthGuard } from '../common-files/guards/auth.guard';
import { GetImagesDto } from './dto/get-images.dto';
import { GetImagesResponseDto } from './dto/get-images-response.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';
import { RemoveFileDto } from './dto/remove-file.dto';
import { RemoveFileResponseDto } from './dto/remove-file-response.dto';
import { UpdateFileInfoDto } from './dto/update-file-info.dto';
import { UpdateFileInfoResponseDto } from './dto/update-file-info-response.dto';
import { CustomErrors } from '../common-files/constants/custom-errors';
import {
  MAX_FILE_SIZE_MB,
  BITES_IN_MB,
} from '../common-files/constants/constants';
import { getUserId } from '../common-files/helpers';
import { IUserRequest } from '../interfaces';

@SkipThrottle()
@ApiTags('Store')
@ApiBearerAuth()
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @UseGuards(AuthGuard)
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
  // Multer handles data posted in the multipart/form-data format, which is primarily used for uploading files via an HTTP POST request.
  // This module is fully configurable and you can adjust its behavior to your application requirements.
  uploadFile(
    @Request() req,
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_FILE_SIZE_MB * BITES_IN_MB,
            message: CustomErrors.FILE_SIZE_LIMIT,
          }),
          new FileTypeValidator({ fileType: 'image/png' }), // TODO: add other valid formats
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // eslint-disable-next-line
    const userId = getUserId((req?.user as IUserRequest) || undefined); // req.user.sub;

    return this.storeService.uploadFile({
      ...{ id: userId },
      ...{ file },
      ...uploadFileDto,
    });
  }

  @UseGuards(AuthGuard)
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
    @Request() req,
    @Body() updateFileInfoDto: UpdateFileInfoDto,
  ) {
    // eslint-disable-next-line
    const userId = getUserId((req?.user as IUserRequest) || undefined); // req.user.sub;

    return this.storeService.updateFileInfo({
      ...{ userId },
      ...updateFileInfoDto,
    });
  }

  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all images by user with pagination and sorting',
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
  @UseInterceptors(ClassSerializerInterceptor) // remove excluded columns from response User item
  @Get('image')
  findAll(@Request() req, @Body() getImagesDto: GetImagesDto) {
    // eslint-disable-next-line
    const userId = getUserId((req?.user as IUserRequest) || undefined); // req.user.sub;
    return this.storeService.findAll({ ...{ id: userId }, ...getImagesDto });
  }

  @UseGuards(AuthGuard)
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
  remove(@Request() req, @Body() removeFileDto: RemoveFileDto) {
    // eslint-disable-next-line
    const userId = getUserId((req?.user as IUserRequest) || undefined); // req.user.sub;
    return this.storeService.removeFile(userId, removeFileDto.id);
  }
}
