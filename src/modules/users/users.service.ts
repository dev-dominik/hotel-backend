import * as bcrypt from 'bcrypt';
import { ConflictException, Injectable } from '@nestjs/common';
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
  }): Promise<ClientUser> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const user = this.usersRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
      role: UserRole.USER,
      permissions: [],
      authProvider: AuthProvider.LOCAL,
    });

    const saved = await this.usersRepository.save(user);

    return this.toClientUser(saved);
  }

  async findOrCreateOAuthUser(data: {
    email: string;
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
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
