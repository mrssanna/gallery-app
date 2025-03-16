import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';
import { GenderType, RoleType } from '../../../interfaces';

export class UserGenderDto {
  @ApiProperty({
    description: 'User genger',
    example: GenderType.MALE,
    examples: Object.values(GenderType),
  })
  @Expose()
  @IsEnum(GenderType)
  gender: string;
}

export class UserRoleDto {
  @ApiProperty({
    description: 'User role',
    example: RoleType.USER,
    examples: Object.values(RoleType),
  })
  @Expose()
  @IsEnum(RoleType)
  role: string;
}

export class UserPersonalInfoDto {
  @ApiProperty({ description: 'User first name', example: 'Иван' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'User middle name', example: 'Иванович' })
  @Expose()
  middleName: string;

  @ApiProperty({ description: 'User last name', example: 'Иванов' })
  @Expose()
  lastName: string;
}
