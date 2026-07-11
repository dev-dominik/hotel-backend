import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 1000 })
  url!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 500 })
  publicId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  folder!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  format!: string | null;

  @Column({ type: 'int', nullable: true })
  bytes!: number | null;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
