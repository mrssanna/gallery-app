import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as sharp from 'sharp';
import { MinioService } from './minio/minio.service';
import {
  BUCKET_NAME,
  BUCKET_THUMBNAILS,
} from '../common-files/constants/constants';
import { BucketType } from '../interfaces';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { getExtension } from '../common-files/helpers';

@Injectable()
export class FileService {
  constructor(private minioService: MinioService) {}

  private readonly logger = new Logger(FileService.name);

  private prepareMinioId = (format: string): string => {
    // Добавляем timestamp прямо в имя файла, чтобы гарантированно обойти кэш браузера
    const timestamp = Date.now();
    const fileId = `${randomUUID()}_${timestamp}.${getExtension(format)}`;
    return fileId;
  };

  async uploadFile(
    file: Express.Multer.File,
    targetBucket: string = BUCKET_NAME,
    thumbnailBucket: string = BUCKET_THUMBNAILS,
  ): Promise<{ path: string; thumbnailPath: string; bucket: string }> {
    try {
      const minioId = this.prepareMinioId(file.mimetype);
      const thumbMinioId = `thumb_${minioId}`;

      this.logger.debug(
        `Uploading file to MinIO. Bucket: ${targetBucket}, Path: ${minioId}`,
      );

      // 1. Загружаем оригинал в целевой бакет
      await this.minioService.uploadBuffer(targetBucket, minioId, {
        buffer: file.buffer,
        mimetype: file.mimetype,
      });

      // 2. Генерируем миниатюру с помощью sharp (300x300, обрезка по центру)
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .toBuffer();

      // 3. Загружаем миниатюру в указанный бакет для миниатюр
      await this.minioService.uploadBuffer(thumbnailBucket, thumbMinioId, {
        buffer: thumbnailBuffer,
        mimetype: file.mimetype,
      });

      this.logger.log(
        `File and thumbnail successfully uploaded to MinIO. Path: ${minioId}`,
      );

      return {
        path: minioId,
        thumbnailPath: thumbMinioId,
        bucket: targetBucket,
      };
    } catch (error) {
      this.logger.error('File upload failed', error);
      throw new InternalServerErrorException(CustomErrors.FILE_UPLOAD_ERROR);
    }
  }

  async removeFile(
    bucket: string,
    path: string,
    thumbnailBucket?: string,
    thumbnailPath?: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Removing file from MinIO. Bucket: ${bucket}, Path: ${path}`,
      );
      await this.minioService.deleteFile(bucket, path);

      if (thumbnailPath && thumbnailBucket) {
        await this.minioService.deleteFile(thumbnailBucket, thumbnailPath);
      }

      this.logger.log(`File successfully removed from MinIO. Path: ${path}`);
    } catch (error) {
      this.logger.error('File removal failed', error);
      throw new InternalServerErrorException(CustomErrors.FILE_REMOVE_ERROR);
    }

    return true;
  }

  async getFilePath(path: string, bucket: BucketType, expiresIn?: number) {
    return await this.minioService.getDownloadUrl(path, bucket, expiresIn);
  }
}
