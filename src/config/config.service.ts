import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { databaseOptions } from '../../db/databaseConfiguration';
import { MinioConfigurationFactory, MinioOptions } from '../interfaces';

@Injectable()
export class ConfigService
  implements
    TypeOrmOptionsFactory,
    ThrottlerOptionsFactory,
    MinioConfigurationFactory
{
  constructor(private configService: NestConfigService) {}

  get typeOrmConfig(): TypeOrmModuleOptions {
    return {
      ...databaseOptions,
      autoLoadEntities: true, // If true, entities will be loaded automatically (default: false)
      synchronize: false, // true shouldn't be used in production - otherwise you can lose production data
    };
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.typeOrmConfig;
  }

  createThrottlerOptions(): ThrottlerModuleOptions {
    return [
      {
        limit: this.configService.getOrThrow<number>('THROTTLER_LIMIT'),
        ttl: this.configService.getOrThrow<number>('THROTTLER_TTL'),
      },
    ];
  }

  get jwtOptions() {
    return {
      jwtAccessTokenSecret: this.configService.getOrThrow<string>(
        'JWT_ACCESS_TOKEN_SECRET',
      ),
      jwtAccessTokenExpTime: this.configService.getOrThrow<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      ),
      jwtRefreshTokenSecret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_SECRET',
      ),
      jwtRefreshTokenExpTime: this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    };
  }

  // eslint-disable-next-line
  async create(): Promise<MinioOptions> {
    return this.minioConfig();
  }

  minioConfig(): MinioOptions {
    return {
      endPoint: this.configService.getOrThrow('MINIO_ENDPOINT'),
      port: Number(this.configService.getOrThrow('MINIO_PORT')),
      accessKey: this.configService.getOrThrow('MINIO_ROOT_USER'),
      secretKey: this.configService.getOrThrow('MINIO_ROOT_PASSWORD'),
      useSSL: this.configService.getOrThrow('MINIO_USE_SSL') === 'true',
      publicURI: this.configService.getOrThrow('MINIO_PUBLIC_URI'),
    };
  }
}
