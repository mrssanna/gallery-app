import { IntersectionType } from '@nestjs/swagger';
import { IdDto } from '../../common-files/dto/id-field.dto';
import { UserLoginDto } from '../../common-files/dto/user-fields.dto';
import {
  CreatedAtDto,
  UpdatedAtDto,
} from '../../common-files/dto/date-fields.dto';
import {
  UserGenderDto,
  UserRoleDto,
  UserPersonalInfoDto,
} from './common/user-profile.dto';

export class GetProfileResponseDto extends IntersectionType(
  IdDto,
  UserLoginDto,
  UserRoleDto,
  UserGenderDto,
  UserPersonalInfoDto,
  CreatedAtDto,
  UpdatedAtDto,
) {}
