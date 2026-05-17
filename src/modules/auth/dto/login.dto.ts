import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
