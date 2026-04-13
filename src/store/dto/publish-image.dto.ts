import { IntersectionType } from '@nestjs/swagger';
import { IdDto } from '../../common-files/dto/id-field.dto';

export class PublishImageDto extends IntersectionType(IdDto) {}
