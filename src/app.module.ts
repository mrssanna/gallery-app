import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { FileModule } from './file/file.module';
import { CustomThrottlerGuard } from './common-files/guards/custom-throttler.guard';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [NestConfigModule],
      useClass: ConfigService,
    }),
    ThrottlerModule.forRootAsync({
      imports: [NestConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.createThrottlerOptions(),
    }),
    UsersModule,
    AuthModule,
    StoreModule,
    FileModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // Используем наш кастомный Guard вместо стандартного ThrottlerGuard
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
