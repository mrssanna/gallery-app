import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common-files/dto/pagination.dto';
import { SortImagesFieldType, SortOrderType } from '../../interfaces';
import { IdDto } from '../../common-files/dto/id-field.dto';

export class GetImagesDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: SortImagesFieldType,
    default: SortImagesFieldType.CREATED_AT,
    description: 'Sort field',
  })
  @IsOptional()
  @IsEnum(SortImagesFieldType)
  sortField: SortImagesFieldType = SortImagesFieldType.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrderType,
    default: SortOrderType.DESC,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(SortOrderType)
  sortOrder: SortOrderType = SortOrderType.DESC;
}

export class GetImagesWithIdDto extends IntersectionType(IdDto, GetImagesDto) {}
