import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entity/user.entity';
import { AdminUserDto, PaginatedUsersResponse } from './dto/admin-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async listUsers(query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    const { search, role, status, page = 1, limit = 20 } = query;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (status === 'active') {
      qb.andWhere('user.isBlocked = false');
    } else if (status === 'blocked') {
      qb.andWhere('user.isBlocked = true');
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((u) => this.toDto(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: string): Promise<AdminUserDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.toDto(user);
  }

  async blockUser(id: string, requesterId: string): Promise<void> {
    if (id === requesterId)
      throw new BadRequestException('You cannot block your own account');

    const user = await this.findOrFail(id);
    user.isBlocked = true;
    await this.usersRepository.save(user);
  }

  async unblockUser(id: string): Promise<void> {
    const user = await this.findOrFail(id);
    user.isBlocked = false;
    await this.usersRepository.save(user);
  }

  async updateUserRole(
    id: string,
    dto: UpdateUserRoleDto,
    requesterId: string,
  ): Promise<AdminUserDto> {
    if (id === requesterId) {
      throw new BadRequestException('You cannot change your own role');
    }
    const user = await this.findOrFail(id);
    user.role = dto.role;
    await this.usersRepository.save(user);
    return this.toDto(user);
  }

  async updateUserPermissions(
    id: string,
    dto: UpdateUserPermissionsDto,
  ): Promise<AdminUserDto> {
    const user = await this.findOrFail(id);
    user.permissions = dto.permissions;
    await this.usersRepository.save(user);
    return this.toDto(user);
  }

  private async findOrFail(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toDto(user: User): AdminUserDto {
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
