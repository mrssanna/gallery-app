import { IntersectionType, PartialType } from '@nestjs/swagger';
import { UserRoleDto } from '../dto/common/user-profile.dto';
import { PaginationDto } from '../../common-files/dto/pagination.dto';
import { SortingUsersDto } from '../../common-files/dto/sort-fields.dto';

export class UserRoleOptionalDto extends PartialType(UserRoleDto) {}

export class GetAllUsersDto extends IntersectionType(
  PaginationDto,
  UserRoleOptionalDto,
  SortingUsersDto,
) {}
