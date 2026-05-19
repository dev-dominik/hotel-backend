import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import type { User } from '@/modules/users/entity/user.entity';
import type { ClientUser } from '@/modules/users/entity/user-client.entity';
import type { RegisterRequest } from './dto/register.dto';
import { AuthProvider } from './entity/auth.provider';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;

    const matches = await bcrypt.compare(password, user.passwordHash);
    return matches ? user : null;
  }

  async register(dto: RegisterRequest): Promise<ClientUser> {
    return await this.usersService.create({
      email: dto.email,
      name: dto.name,
      password: dto.password,
    });
  }

  async findOrCreateOAuthUser(data: {
    email: string;
    name: string;
    provider: AuthProvider;
  }): Promise<User> {
    return await this.usersService.findOrCreateOAuthUser(data);
  }

  toClientUser(user: User): ClientUser {
    return this.usersService.toClientUser(user);
  }
}
