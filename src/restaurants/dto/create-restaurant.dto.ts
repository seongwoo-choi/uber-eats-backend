import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from '../../common/dto/output.dto';

// class-validator 설정을 해줬다 해도 유효성 검사가 되는 것이 아니다.
// validation-pipeline 을 만들어줘야 한다.
// OmitType 으로 extends 한 Restaurant 클래스에서 유효성 검사를 체크, 자식 클래스에서도 유효성 검사가 이뤄진다.
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'address',
  'coverImage',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
