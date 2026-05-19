import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserRole } from './user.role';
import { AuthProvider } from '../../auth/entity/auth.provider';

@Entity()
export class User {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  @Column({ unique: true })
  email!: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  name!: string;

  @ApiPropertyOptional({
    description: 'Hashed password (null for OAuth users)',
    example: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36S0gYyFj5a2r5u4i8a',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true, default: null })
  passwordHash!: string | null;

  @ApiProperty({
    description: 'Authentication provider',
    enum: AuthProvider,
    example: AuthProvider.LOCAL,
  })
  @IsEnum(AuthProvider)
  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider!: AuthProvider;

  @ApiProperty({
    description: 'Role of the user in the system',
    example: UserRole.EMPLOYEE,
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @ApiProperty({
    description: 'Permissions assigned to the user',
    example: ['read:reports', 'write:reports'],
  })
  @Column('simple-array')
  permissions!: string[];

  @ApiPropertyOptional({
    description: "Timestamp of the user's last login",
    example: '2026-03-20T14:45:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Column({ type: 'timestamptz', nullable: true, default: null })
  lastLoginAt!: Date | null;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2026-03-20T14:45:00.000Z',
  })
  @IsDate()
  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2026-01-15T10:30:00.000Z',
  })
  @IsDate()
  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the user was soft-deleted',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @DeleteDateColumn()
  deletedAt!: Date | null;
}
