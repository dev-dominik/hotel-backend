import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailRequest {
  @ApiProperty({ description: 'Email confirmation token' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
