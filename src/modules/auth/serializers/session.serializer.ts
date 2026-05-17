import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entity/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: unknown, id?: string) => void): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: unknown, user?: User | null) => void,
  ): Promise<void> {
    const user = await this.usersService.findById(id);
    done(null, user);
  }
}
