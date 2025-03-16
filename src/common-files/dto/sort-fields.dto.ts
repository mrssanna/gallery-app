import { IsEnum } from 'class-validator';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  SortImagesFieldType,
  SortUsersFieldType,
  SortOrderType,
} from '../../interfaces';

export class SortImagesFieldDto {
  @ApiPropertyOptional({
    description: 'Sort field',
    examples: Object.values(SortImagesFieldType),
    default: SortImagesFieldType.CREATED_AT,
  })
  @IsEnum(SortImagesFieldType)
  sortField: SortImagesFieldType;
}

export class SortUsersFieldDto {
  @ApiPropertyOptional({
    description: 'Sort field',
    examples: Object.values(SortUsersFieldType),
    default: SortUsersFieldType.CREATED_AT,
  })
  @IsEnum(SortUsersFieldType)
  sortField: SortUsersFieldType;
}

export class SortOrderDto {
  @ApiPropertyOptional({
    description: 'Sort order',
    examples: Object.values(SortOrderType),
    default: SortOrderType.DESC,
  })
  @IsEnum(SortOrderType)
  sortOrder: SortOrderType;
}

export class SortingImagesDto extends IntersectionType(
  SortImagesFieldDto,
  SortOrderDto,
) {}

export class SortingUsersDto extends IntersectionType(
  SortUsersFieldDto,
  SortOrderDto,
) {}
