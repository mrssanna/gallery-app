import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MinioService } from './minio/minio.service';
import { BUCKET_NAME } from '../common-files/constants/constants';
import { BucketType } from '../interfaces';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { getExtension } from '../common-files/helpers';

@Injectable()
export class FileService {
  constructor(private minioService: MinioService) {}

  private readonly logger = new Logger(FileService.name);

  private prepareMinioId = (format: string): string => {
    const fileId = randomUUID() + '.' + getExtension(format);
    return fileId;
  };

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ path: string; bucket: string }> {
    try {
      const minioId = this.prepareMinioId(file.mimetype);
      const bucket = BUCKET_NAME;

      await this.minioService.uploadBuffer(bucket, minioId, {
        buffer: file.buffer,
        mimetype: file.mimetype,
      });

      return {
        path: minioId,
        bucket,
      };
    } catch (error) {
      this.logger.error('File upload failed', error);
      throw new InternalServerErrorException(CustomErrors.FILE_UPLOAD_ERROR);
    }
  }

  async removeFile(bucket: string, path: string): Promise<boolean> {
    try {
      await this.minioService.deleteFile(bucket, path);
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
