import { IntersectionType, ApiProperty } from '@nestjs/swagger';
import { IdDto } from '../../../common-files/dto/id-field.dto';
import {
  CreatedAtDto,
  UpdatedAtDto,
} from '../../../common-files/dto/date-fields.dto';
import { ImageInfoResponseDto } from './image-info.dto';
import { ImageFormat } from 'src/interfaces';

export class ImageItemResponseDto extends IntersectionType(
  IdDto,
  ImageInfoResponseDto,
  CreatedAtDto,
  UpdatedAtDto,
) {
  @ApiProperty({ description: 'Image url' })
  url: string;

  @ApiProperty({ description: 'Image format', example: ImageFormat.PNG, examples: Object.values(ImageFormat) })
  format: string;

  @ApiProperty({
    description: 'Date of publish',
    example: '2025-01-30T20:17:24.800Z',
  })
  publishedAt: Date;
}
