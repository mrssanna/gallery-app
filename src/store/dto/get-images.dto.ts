import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from '../../common-files/dto/pagination.dto';
import { SortingImagesDto } from '../../common-files/dto/sort-fields.dto';
import { IdDto } from '../../common-files/dto/id-field.dto';

export class GetImagesDto extends IntersectionType(
  PaginationDto,
  SortingImagesDto,
) {}

export class GetImagesWithIdDto extends IntersectionType(IdDto, GetImagesDto) {}
