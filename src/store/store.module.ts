import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreGateway } from './store.gateway';
import { FileModule } from '../file/file.module';
import { User } from '../users/entities/user.entity';
import { Image } from './entities/image.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Image]),
    FileModule,
    forwardRef(() => UsersModule), // Используем forwardRef
  ],
  controllers: [StoreController],
  providers: [StoreService, StoreGateway],
  exports: [StoreService], // Экспортируем StoreService, чтобы UsersService мог его использовать
})
export class StoreModule {}
