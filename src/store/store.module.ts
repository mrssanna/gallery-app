import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { FileModule } from '../file/file.module';
import { User } from '../users/entities/user.entity';
import { Image } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Image]), FileModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
