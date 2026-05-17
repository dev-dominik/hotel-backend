import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SuccessResponse {
  @IsBoolean()
  @ApiProperty({
    description: 'Operation succeeded',
  })
  success!: boolean;
}
