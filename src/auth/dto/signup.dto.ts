import { IntersectionType } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  UserLoginDto,
  UserPasswordDto,
} from '../../common-files/dto/user-fields.dto';

export class SignUpDto extends IntersectionType(UserLoginDto, UserPasswordDto) {
  constructor(partial: Partial<SignUpDto>) {
    super(partial);
    // Здесь можно оставить plainToInstance, так как это входная точка,
    // но для единообразия и надежности лучше тоже использовать Object.assign,
    // полагаясь на ValidationPipe контроллера.
    // Object.assign(this, partial);
    return plainToInstance(SignUpDto, partial, {
      excludeExtraneousValues: true,
    });
  }
}
