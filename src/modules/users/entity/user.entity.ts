import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user.role';
import { AuthProvider } from '../../auth/entity/auth.provider';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  passwordHash!: string | null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider!: AuthProvider;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  isBlocked!: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  emailConfirmToken!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column('simple-array')
  permissions!: string[];

  @Column({ type: 'timestamptz', nullable: true, default: null })
  lastLoginAt!: Date | null;

  @UpdateDateColumn()
  updatedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
