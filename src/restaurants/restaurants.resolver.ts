import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

// of 는 아무런 의미가 없는 값이다
// 해당 리졸버는 레스토랑의 리졸버가 됐다.
// 꼭 필요한 것은 아니다. @Resolver() 이렇게 사용해도 된다.
@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  // restaurant service 를 DI 받는다.
  constructor(private readonly restaurantService: RestaurantService) {}

  // Query 가 리턴하는 값은 레스토랑 배열값
  @Query((returns) => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation((returns) => Boolean)
  async createRestaurant(
    // @Args('createRestaurantInput') CreateRestaurantInput: createRestaurantDto,
    // CreateRestaurantDto 에서 유효성 검사를 하고 있기 때문에 자동적으로 유효성 검사가 된다.
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation((returns) => Boolean)
  async updateRestaurant(
    // 원래라면 아래와 같은 방식으로 사용한다.
    // @Args('id') id: number,
    // @Args('data') data: UpdateRestaurantDto,
    // 하지만 아래처럼 하나의 dto 로 처리하는 것이 깔끔하다.
    @Args() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
