import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

// id 를 받아야 한다. 어떤 레스토랑을 수정하기 위해선 id 가 필요
@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}

// updateRestaurantDto 하나로 표현하기 위해서 아래와 같이 작성
@ArgsType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
