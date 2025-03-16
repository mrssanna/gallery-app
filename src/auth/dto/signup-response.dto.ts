import { IntersectionType } from '@nestjs/swagger';
import {
  AccessTokenDto,
  RefreshTokenDto,
} from '../../common-files/dto/token-fields.dto';
import { SuccessResponseDto } from '../../common-files/dto/success-response-field.dto';

export class SignUpResponseDto extends IntersectionType(
  SuccessResponseDto,
  AccessTokenDto,
  RefreshTokenDto,
) {}
