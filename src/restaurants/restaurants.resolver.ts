import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';

// of 는 아무런 의미가 없는 값이다
// 해당 리졸버는 레스토랑의 리졸버가 됐다.
// 꼭 필요한 것은 아니다. @Resolver() 이렇게 사용해도 된다.
@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  // restaurant service 를 DI 받는다.
  constructor(private readonly restaurantService: RestaurantService) {}

  // this Query return Boolean data
  // typeFunc => 쿼리가 리턴하고자 하는 타입을 리턴하는 func 이어야 한다.
  // 첫 번째 알규먼트로 func 이 필요하다. returns 는 아무 의미 없는 값이다. 애로우 펑션을 만들기 위한 값
  // @Query((returns) => Boolean)
  // isPizzaGood() {
  //   return true;
  // }

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
}
