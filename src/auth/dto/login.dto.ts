import { IntersectionType } from '@nestjs/swagger';
import {
  UserLoginDto,
  UserPasswordDto,
} from '../../common-files/dto/user-fields.dto';

export class LoginDto extends IntersectionType(UserLoginDto, UserPasswordDto) {}
