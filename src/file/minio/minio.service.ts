import { Injectable, Logger } from '@nestjs/common';
import { MinioService as MinioServiceLibrary } from 'nestjs-minio-client';
import { DEFAULT_REGION } from '../../common-files/constants/constants';
import { BucketType } from '../../interfaces';

@Injectable()
export class MinioService {
  constructor(private readonly minioService: MinioServiceLibrary) {}

  private readonly logger = new Logger(MinioService.name);

  async isBucketExists(bucket: BucketType): Promise<boolean> {
    return this.minioService.client.bucketExists(bucket);
  }

  async checkBucket(bucket: BucketType) {
    const isExists = await this.isBucketExists(bucket);

    if (!isExists) {
      this.logger.log(`Bucket '${bucket}' does not exist. Creating it...`);
      await this.minioService.client.makeBucket(bucket, DEFAULT_REGION);
      this.logger.log(`Bucket '${bucket}' created successfully.`);
    }
  }

  async getDownloadUrl(
    path: string,
    bucket: BucketType,
    expiresIn?: number,
  ): Promise<string> {
    const url = expiresIn
      ? await this.minioService.client.presignedUrl(
          'GET',
          bucket,
          path,
          expiresIn,
        )
      : await this.minioService.client.presignedUrl('GET', bucket, path);
    return url.toString();
  }

  // async getDownloadUrl(
  //   minioPath: MinioPath,
  //   expiresIn?: number,
  // ): Promise<string> {
  //   const { bucket, path } = minioPath;

  //   const minioConfig = this.configService.minioConfig();

  //   const publicURL = new URL(minioConfig.publicURI);

  //   const presignedUrl = expiresIn
  //     ? this.minioService.client.presignedUrl('GET', bucket, path, expiresIn)
  //     : this.minioService.client.presignedUrl('GET', bucket, path);

  //   const minioObjectURL = await presignedUrl.catch((err) => {
  //     this.logger.error(err);
  //     throw new NotFoundException(CustomErrors.FILE_NOT_FOUND);
  //   });

  //   const url = new URL(minioObjectURL);

  //   url.host = publicURL.host;
  //   url.port = publicURL.port;
  //   url.protocol = publicURL.protocol;

  //   return url.toString();
  // }

  async uploadBuffer(bucket: string, path: string, file: any) {
    await this.checkBucket(bucket);

    // eslint-disable-next-line
    const mimetype = file?.mimetype || '';
    // const imageFormat = parseFormat(mimetype);

    const metadata: Record<string, string | number> = {
      // eslint-disable-next-line
      'Content-Type': mimetype || '',
    };
    //   const imageSize = await getImageSize(file.buffer);

    //   if (imageSize) {
    //     metadata.width = imageSize.width;
    //     metadata.height = imageSize.height;
    //   }

    try {
      this.logger.debug(`Executing MinIO putObject for path: ${path}`);
      await this.minioService.client.putObject(
        bucket,
        path,
        // eslint-disable-next-line
        file?.buffer,
        metadata,
      );

      return true;
    } catch (e) {
      this.logger.error('Error during upload file to MinIO', e);
      return false;
    }
  }

  async deleteFile(bucket: string, path: string) {
    this.logger.debug(`Executing MinIO removeObject for path: ${path}`);
    return this.minioService.client.removeObject(bucket, path);
  }
}
