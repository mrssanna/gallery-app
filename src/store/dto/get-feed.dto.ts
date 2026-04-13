import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common-files/dto/pagination.dto';

export enum SortFeedFieldType {
  PUBLISHED_AT = 'publishedAt',
  CREATED_AT = 'createdAt',
}

export enum SortOrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetFeedDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: SortFeedFieldType,
    default: SortFeedFieldType.PUBLISHED_AT,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(SortFeedFieldType)
  sortField: SortFeedFieldType = SortFeedFieldType.PUBLISHED_AT;

  @ApiPropertyOptional({
    enum: SortOrderType,
    default: SortOrderType.DESC,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(SortOrderType)
  sortOrder: SortOrderType = SortOrderType.DESC;

  @ApiPropertyOptional({
    description: 'Search query (title or author)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
