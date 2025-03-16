import { ApiProperty } from '@nestjs/swagger';

export class CreatedAtDto {
  @ApiProperty({
    description: 'Created at date',
    example: '2025-01-30T20:17:24.800Z',
  })
  createdAt: Date;
}

export class UpdatedAtDto {
  @ApiProperty({
    description: 'Updated at date',
    example: '2025-01-30T20:17:24.800Z',
  })
  updatedAt: Date;
}
