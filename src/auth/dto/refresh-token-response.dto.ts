import { IntersectionType } from '@nestjs/swagger';
import {
  AccessTokenDto,
  RefreshTokenDto,
} from '../../common-files/dto/token-fields.dto';

export class RefreshTokenResponseDto extends IntersectionType(
  AccessTokenDto,
  RefreshTokenDto,
) {}
