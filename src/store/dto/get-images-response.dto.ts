import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '../../common-files/dto/pagination.dto';
import { ImageItemResponseDto } from './common/image-item.dto';

export class GetImagesResponseDto {
  @ApiProperty({ type: () => ImageItemResponseDto, isArray: true })
  node: ImageItemResponseDto[];

  @ApiProperty({ type: () => PaginationResponseDto })
  pageInfo: PaginationResponseDto;
}
