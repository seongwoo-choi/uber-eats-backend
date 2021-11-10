import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entites/user.entity';
import { UsersService } from './user.service';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query((returns) => String)
  async hi() {
    return 'hi';
  }

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccount: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const { ok, error } = await this.userService.createAccount(createAccount);

      return {
        ok,
        error,
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }
}
