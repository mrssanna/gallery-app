import { IntersectionType } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { IdDto } from '../../common-files/dto/id-field.dto';
import { UserGenderDto, UserPersonalInfoDto } from './common/user-profile.dto';

export class UpdateProfileDto extends IntersectionType(
  UserGenderDto,
  UserPersonalInfoDto,
) {}

export class UpdateProfileWithIdDto extends IntersectionType(
  IdDto,
  UserGenderDto,
  UserPersonalInfoDto,
) {
  constructor(partial: Partial<UpdateProfileWithIdDto>) {
    // TODO: check it
    // super();
    // Object.assign(this, partial);
    super(partial);
    return plainToInstance(UpdateProfileWithIdDto, partial, {
      excludeExtraneousValues: true,
    });
  }
}
