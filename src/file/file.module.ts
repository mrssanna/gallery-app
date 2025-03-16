import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { FileService } from './file.service';
import { MinioService } from './minio/minio.service';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    MinioModule.registerAsync({
      useClass: ConfigService,
      imports: [NestConfigModule],
    }),
    ConfigModule,
  ],
  providers: [FileService, MinioService],
  exports: [FileService, MinioService],
})
export class FileModule {}
