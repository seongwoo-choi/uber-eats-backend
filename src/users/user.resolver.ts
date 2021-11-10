import { Query, Resolver } from '@nestjs/graphql';
import { User } from './entites/user.entity';
import { UsersService } from './user.service';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query((returns) => Boolean)
  async getAll() {
    return true;
  }
}
