import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IdDto } from '../../common-files/dto/id-field.dto';
import { UserLoginDto } from '../../common-files/dto/user-fields.dto';
import {
  CreatedAtDto,
  UpdatedAtDto,
} from '../../common-files/dto/date-fields.dto';
import {
  UserRoleDto,
  UserGenderDto,
  UserPersonalInfoDto,
} from './common/user-profile.dto';
import { PaginationResponseDto } from '../../common-files/dto/pagination.dto';

export class UserItem extends IntersectionType(
  IdDto,
  UserLoginDto,
  UserRoleDto,
  UserGenderDto,
  UserPersonalInfoDto,
  CreatedAtDto,
  UpdatedAtDto,
) {}

export class GetAllUsersResponseDto {
  @ApiProperty({ type: () => UserItem, isArray: true })
  node: UserItem[];

  @ApiProperty({ type: () => PaginationResponseDto })
  pageInfo: PaginationResponseDto;
}
