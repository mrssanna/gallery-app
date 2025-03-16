import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccessTokenDto {
  @ApiProperty({ description: 'Access token', example: 'Dk6a0aFV5aCgjF3' })
  accessToken: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'Hgvad13hfgd6g87',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token', example: 'Hgvad13hfgd6g87' })
  refreshToken: string;
}

export class RefreshTokenResponseDto extends RefreshTokenDto {}
