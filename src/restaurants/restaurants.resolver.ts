import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

// of 는 아무런 의미가 없는 값이다
// 해당 리졸버는 레스토랑의 리졸버가 됐다.
// 꼭 필요한 것은 아니다. @Resolver() 이렇게 사용해도 된다.
@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  // this Query return Boolean data
  // typeFunc => 쿼리가 리턴하고자 하는 타입을 리턴하는 func 이어야 한다.
  // 첫 번째 알규먼트로 func 이 필요하다. returns 는 아무 의미 없는 값이다. 애로우 펑션을 만들기 위한 값
  // @Query((returns) => Boolean)
  // isPizzaGood() {
  //   return true;
  // }

  // Query 가 리턴하는 값은 레스토랑 배열값
  @Query((returns) => [Restaurant])
  // @Args('veganOnly') for graphQL, veganOnly: boolean for our func
  // and boolean has working both typescript and graphql
  restuarants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }

  @Mutation((returns) => Boolean)
  createRestaurant(
    // @Args('name') name: string,
    // @Args('isVegan') isVegan: boolean,
    // @Args('address') address: string,
    // @Args('ownersName') ownersName: string,

    // InputType 을 사용하여 위를 아래와 같이 줄일 수 있게 됐다.
    // 다만 문제는 CreateRestaurantDto 의 모든 속성에 대한 값을 입력받아야 한다는 점이다.
    // @Args('createRestaurantInput') CreateRestaurantInput: createRestaurantDto,
    @Args() createRestaurantDto: CreateRestaurantDto,
  ): boolean {
    console.log(createRestaurantDto);
    return true;
  }
}
