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

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

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
  }): Promise<{ user: ClientUser; emailConfirmToken: string }> {
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

    return { user: this.toClientUser(saved), emailConfirmToken };
  }

  async confirmEmail(token: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { emailConfirmToken: token },
    });
    if (!user)
      throw new NotFoundException('Invalid or expired confirmation token');

    user.emailVerified = true;
    user.emailConfirmToken = null;
    await this.usersRepository.save(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, { passwordHash });
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
}
