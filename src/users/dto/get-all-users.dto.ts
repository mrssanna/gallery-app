import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common-files/dto/pagination.dto';
import { RoleType, SortOrderType, SortUsersFieldType } from '../../interfaces';

export class GetAllUsersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: RoleType, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @ApiPropertyOptional({
    enum: SortUsersFieldType,
    default: SortUsersFieldType.CREATED_AT,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(SortUsersFieldType)
  sortField: SortUsersFieldType = SortUsersFieldType.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrderType,
    default: SortOrderType.DESC,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(SortOrderType)
  sortOrder: SortOrderType = SortOrderType.DESC;
}
