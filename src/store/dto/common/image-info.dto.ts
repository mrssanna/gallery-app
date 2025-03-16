import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class ImageInfoDto {
  @ApiPropertyOptional({ description: 'Image title', example: 'Title', default: '' })
  @IsString()
  @IsOptional()
  @Expose()
  title?: string;

  @ApiPropertyOptional({ description: 'Image author', example: 'Author', default: '' })
  @IsString()
  @IsOptional()
  @Expose()
  author?: string;
}

export class ImageInfoResponseDto {
  @ApiProperty({ description: 'Image title', example: 'Title' })
  title: string;

  @ApiProperty({ description: 'Image author', example: 'Author' })
  author: string;
}
