import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

@Global() // visible in all modules
@Module({
  imports: [NestConfigModule.forRoot()],
  exports: [ConfigService],
  providers: [ConfigService],
})
export class ConfigModule {}
