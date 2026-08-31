import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity.js';
import { UserRole } from './entity/user.role.js';
import { ClientUser } from './entity/user-client.entity.js';
import { AuthProvider } from '@/modules/auth/entity/auth.provider';
import { AdminUserDto } from './dto/admin-user.dto.js';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async search(
    filters: {
      email?: string;
      name?: string;
      role?: UserRole;
      isBlocked?: boolean;
    },
    page: number,
    limit: number,
  ): Promise<{ items: User[]; total: number }> {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (filters.email)
      qb.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
    if (filters.name)
      qb.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` });
    if (filters.role) qb.andWhere('user.role = :role', { role: filters.role });
    if (filters.isBlocked !== undefined)
      qb.andWhere('user.isBlocked = :isBlocked', {
        isBlocked: filters.isBlocked,
      });

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async create(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<{
    user: User;
    emailConfirmToken: string;
  }> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const emailConfirmToken = crypto.randomBytes(32).toString('hex');
    const user = this.usersRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
      role: UserRole.USER,
      permissions: [],
      authProvider: AuthProvider.LOCAL,
      emailVerified: false,
      emailConfirmToken,
    });

    const saved = await this.usersRepository.save(user);

    return { user: saved, emailConfirmToken };
  }

  async findOrCreateOAuthUser(data: {
    email: string;
    emailVerified?: boolean;
    name: string;
    provider: AuthProvider;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing && existing.authProvider !== data.provider) {
      throw new ConflictException(
        `Email already in use with a different provider.`,
      );
    }
    if (existing) return existing;

    const user = this.usersRepository.create({
      email: data.email,
      name: data.name,
      passwordHash: null,
      role: UserRole.USER,
      permissions: [],
      authProvider: data.provider,
      emailVerified: data.emailVerified ?? true,
    });

    return await this.usersRepository.save(user);
  }

  private async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.usersRepository.update(id, data);

    if (updatedUser.affected === 0)
      throw new NotFoundException('User not found');

    return updatedUser.raw[0] as User;
  }

  async confirmEmail(token: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { emailConfirmToken: token },
    });
    if (!user)
      throw new NotFoundException('Invalid or expired confirmation token');

    await this.update(user.id, {
      emailVerified: true,
      emailConfirmToken: null,
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.update(id, { passwordHash });
  }

  async block(id: string): Promise<User> {
    return await this.update(id, { isBlocked: true });
  }

  async unblock(id: string): Promise<User> {
    return await this.update(id, { isBlocked: false });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    return await this.update(id, { role });
  }

  async updatePermissions(id: string, permissions: string[]): Promise<User> {
    return await this.update(id, { permissions });
  }

  toClientUser(user: User): ClientUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      isBlocked: user.isBlocked,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  toAdminUser(user: User): AdminUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      isBlocked: user.isBlocked,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
