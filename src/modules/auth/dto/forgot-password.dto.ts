import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequest {
  @ApiProperty({
    description: 'Email address associated with the account',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email!: string;
}
