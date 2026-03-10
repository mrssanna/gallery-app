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

class UserBase1 extends IntersectionType(IdDto, UserLoginDto) {}
class UserBase2 extends IntersectionType(UserBase1, UserRoleDto) {}
class UserBase3 extends IntersectionType(UserBase2, UserGenderDto) {}
class UserBase4 extends IntersectionType(UserBase3, UserPersonalInfoDto) {}
class UserBase5 extends IntersectionType(UserBase4, CreatedAtDto) {}

export class UserItem extends IntersectionType(UserBase5, UpdatedAtDto) {}

export class GetAllUsersResponseDto {
  @ApiProperty({ type: () => UserItem, isArray: true })
  node: UserItem[];

  @ApiProperty({ type: () => PaginationResponseDto })
  pageInfo: PaginationResponseDto;
}
