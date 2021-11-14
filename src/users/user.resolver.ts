import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './user.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query((returns) => String)
  async hi() {
    return 'hi';
  }

  @Query((returns) => [User])
  async getAll(): Promise<User[]> {
    return this.userService.getAll();
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

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.userService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  // @Query((returns) => User)
  // // 로그인 되어있지 않다면 request 진행을 막는다.
  // @UseGuards(AuthGuard)
  // async me(@Context() context) {
  //   return context['user'];
  // }

  @Query((returns) => User)
  // 로그인 되어있지 않다면 request 진행을 막는다.
  @UseGuards(AuthGuard)
  async me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query((returns) => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.userService.findById(userProfileInput.userId);
      if (!user) {
        throw Error('NotFoundUser');
      }
      return {
        ok: true,
        user: user,
      };
    } catch (e) {
      console.log(e);
      return {
        error: '해당하는 유저를 찾을 수 없습니다.',
        ok: false,
      };
    }
  }
}
