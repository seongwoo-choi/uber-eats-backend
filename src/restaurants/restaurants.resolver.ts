import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { UseGuards } from '@nestjs/common';

// of 는 아무런 의미가 없는 값이다
// 해당 리졸버는 레스토랑의 리졸버가 됐다.
// 꼭 필요한 것은 아니다. @Resolver() 이렇게 사용해도 된다.
@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  // restaurant service 를 DI 받는다.
  constructor(private readonly restaurantService: RestaurantService) {}

  @UseGuards()
  @Mutation(() => CreateRestaurantOutput)
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}
