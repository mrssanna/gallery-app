import { Injectable, Logger } from '@nestjs/common';
import { MinioService as MinioServiceLibrary } from 'nestjs-minio-client';
import * as Minio from 'minio';
import { DEFAULT_REGION } from '../../common-files/constants/constants';
import { BucketType } from '../../interfaces';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private presignedClient: Minio.Client;

  constructor(
    private readonly minioService: MinioServiceLibrary,
    private readonly configService: ConfigService,
  ) {
    const minioConfig = this.configService.minioConfig();
    let endPoint = minioConfig.endPoint;
    let port = minioConfig.port;

    if (minioConfig.publicURI) {
      const publicUrl = new URL(minioConfig.publicURI);
      endPoint = publicUrl.hostname;
      port =
        Number(publicUrl.port) || (publicUrl.protocol === 'https:' ? 443 : 80);
    }

    this.presignedClient = new Minio.Client({
      endPoint: endPoint,
      port: port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
      region: DEFAULT_REGION, // <-- ВАЖНО: Явно указываем регион, чтобы избежать сетевых запросов при генерации ссылок
    });
  }

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
    const urlString = expiresIn
      ? await this.presignedClient.presignedUrl('GET', bucket, path, expiresIn)
      : await this.presignedClient.presignedUrl('GET', bucket, path);

    return urlString;
  }

  async uploadBuffer(bucket: string, path: string, file: any) {
    await this.checkBucket(bucket);

    // eslint-disable-next-line
    const mimetype = file?.mimetype || '';

    const metadata: Record<string, string | number> = {
      // eslint-disable-next-line
      'Content-Type': mimetype || '',
    };

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
