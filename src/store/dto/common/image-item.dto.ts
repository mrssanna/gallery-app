import { IntersectionType, ApiProperty } from '@nestjs/swagger';
import { IdDto } from '../../../common-files/dto/id-field.dto';
import {
  CreatedAtDto,
  UpdatedAtDto,
} from '../../../common-files/dto/date-fields.dto';
import { ImageInfoResponseDto } from './image-info.dto';
import { ImageFormat } from '../../../interfaces';

class ImageBase1 extends IntersectionType(IdDto, ImageInfoResponseDto) {}
class ImageBase2 extends IntersectionType(ImageBase1, CreatedAtDto) {}

export class ImageItemResponseDto extends IntersectionType(
  ImageBase2,
  UpdatedAtDto,
) {
  @ApiProperty({ description: 'Image url' })
  url: string;

  @ApiProperty({
    description: 'Image format',
    example: ImageFormat.PNG,
    examples: Object.values(ImageFormat),
  })
  format: string;

  @ApiProperty({
    description: 'Date of publish',
    example: '2025-01-30T20:17:24.800Z',
  })
  publishedAt: Date;
}
