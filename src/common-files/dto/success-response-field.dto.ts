import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({ description: 'Response status value', example: 'true' })
  success: boolean;
}
