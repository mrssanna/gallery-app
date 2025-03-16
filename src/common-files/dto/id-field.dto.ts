import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class IdDto {
  @ApiProperty({
    description: "Generated column('uuid')",
    example: '4b758527-78a3-470d-a4d2-cec8175a803e',
  })
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
