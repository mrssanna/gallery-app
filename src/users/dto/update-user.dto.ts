import { IntersectionType } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserLoginDto } from '../../common-files/dto/user-fields.dto';

export class UpdateUserDto extends IntersectionType(UserLoginDto) {
  constructor(partial: Partial<UpdateUserDto>) {
    super(partial);
    return plainToInstance(UpdateUserDto, partial, {
      excludeExtraneousValues: true,
    });
  }
}
