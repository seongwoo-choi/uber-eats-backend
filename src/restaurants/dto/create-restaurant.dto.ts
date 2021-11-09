import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

// class-validator 설정을 해줬다 해도 유효성 검사가 되는 것이 아니다.
// validation-pipeline 을 만들어줘야 한다.
// OmitType 으로 extends 한 Restaurant 클래스에서 유효성 검사를 체크, 자식 클래스에서도 유효성 검사가 이뤄진다.
@InputType()
// @ArgsType()
// id 를 제외한 레스토랑 엔티티를 상속받는다. Omit 타입은 @InputType 에서만 작동한다. Restaurant 은 오브젝트 타입이다..
// Parent class 와 childe class 의 타입이 다른 경우!! 부모 타입은 ObjectType, 자식 타입은 InputType => 두번째 argument 로 변환 타입을 선언한다.
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  // 그래서 OmitType 의 arguments 로 상속을 받을 때 데코레이터를 @ObjectType 에서 @InputType 으로 변환해서 가져와야 한다.
  // InputType,
) {}
