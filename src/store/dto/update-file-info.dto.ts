import { plainToInstance, Expose } from 'class-transformer';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { IdDto } from '../../common-files/dto/id-field.dto';
import { ImageInfoDto } from './common/image-info.dto';

export class UpdateFileInfoDto extends IntersectionType(IdDto, ImageInfoDto) {}

export class UpdateFileInfoFullDto extends UpdateFileInfoDto {
  @ApiProperty({
    description: "Generated column('uuid')",
    example: '4b758527-78a3-470d-a4d2-cec8175a803e',
  })
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  constructor(partial: Partial<UpdateFileInfoFullDto>) {
    super(partial);
    return plainToInstance(UpdateFileInfoFullDto, partial, {
      excludeExtraneousValues: true,
    });
  }
}
