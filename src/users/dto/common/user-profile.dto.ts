import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
  @IsOptional()
  gender: GenderType;
}

export class UserRoleDto {
  @ApiProperty({
    description: 'User role',
    example: RoleType.USER,
    examples: Object.values(RoleType),
  })
  @Expose()
  @IsEnum(RoleType)
  role: RoleType;
}

export class UserPersonalInfoDto {
  @ApiPropertyOptional({ description: 'User first name', example: 'Иван' })
  @Expose()
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional({ description: 'User middle name', example: 'Иванович' })
  @Expose()
  @IsString()
  @IsOptional()
  middleName: string;

  @ApiPropertyOptional({ description: 'User last name', example: 'Иванов' })
  @Expose()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({ description: 'User avatar URL (thumbnail)' })
  @Expose()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'User original avatar URL' })
  @Expose()
  originalAvatarUrl?: string;
}
