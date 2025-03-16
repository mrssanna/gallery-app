import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import { CustomErrors } from '../constants/custom-errors';
import { EmailRegex, PasswordRegex } from '../constants/validations';

export class UserLoginDto {
  @ApiProperty({ description: 'User email', example: 'test@mail.ru' })
  @Expose()
  @Matches(EmailRegex, { message: CustomErrors.LOGIN_IS_NOT_VALID_FORMAT })
  login: string;
}

export class UserPasswordDto {
  @ApiProperty({
    description: 'User password',
    example: 'password',
  })
  @Expose()
  @Matches(PasswordRegex, {
    message: CustomErrors.PASSWORD_IS_NOT_VALID_FORMAT,
  })
  password: string;
}
