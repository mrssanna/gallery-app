import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { DEFAULT_PER_PAGE } from '../constants/constants';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Number of page', default: 1 })
  @IsNumber()
  @IsOptional()
  // eslint-disable-next-line
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  pageNo: number;

  @ApiPropertyOptional({
    description: 'Rows per page',
    default: DEFAULT_PER_PAGE,
  })
  @IsNumber()
  @IsOptional()
  // eslint-disable-next-line
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  perPage: number;
}

export class PaginationResponseDto {
  @ApiProperty({ description: 'Number of page', default: 1 })
  pageNo: number;

  @ApiProperty({
    description: 'Rows per page',
    default: DEFAULT_PER_PAGE,
  })
  perPage: number;

  @ApiProperty({ description: 'Total count of page' })
  totalPageCount: number;

  @ApiProperty({ description: 'Total count' })
  totalCount: number;
}
