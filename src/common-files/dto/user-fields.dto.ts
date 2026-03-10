import { ApiProperty } from '@nestjs/swagger';
import { Matches, Length } from 'class-validator';
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
    example: 'Password123!',
  })
  @Expose()
  @Length(8, 20, {
    message: CustomErrors.PASSWORD_INVALID_LENGTH,
  })
  @Matches(PasswordRegex, {
    message: CustomErrors.PASSWORD_IS_NOT_VALID_FORMAT,
  })
  password: string;
}
