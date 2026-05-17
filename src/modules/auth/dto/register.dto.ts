import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
