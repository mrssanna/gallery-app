import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IdDto } from '../../common-files/dto/id-field.dto';
import { ImageInfoDto } from './common/image-info.dto';

export class UploadFileDto extends ImageInfoDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;
}

export class UploadFileFullDto extends IntersectionType(IdDto, UploadFileDto) {}
