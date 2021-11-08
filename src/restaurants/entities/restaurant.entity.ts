import { Field, ObjectType } from '@nestjs/graphql';

// create object type for Restaurant
// InputType, ObjectType, ArgumentType 모두 GraphQL 내부에서 사용될 타입을 지정해주는 어노테이션
@ObjectType()
export class Restaurant {
  // Field 어노테이션의 type 은 아무런 의미가 없는 값이다. (), _, type 어떤 것이 와도 상관이 없다.
  // 단지 이 컬럼의 값이 GraphQL 에서 어떤 타입을 갖는지를 나타내주는 것이다.
  @Field((type) => String)
  name: string;

  @Field((type) => Boolean, { nullable: true })
  isVegan?: boolean;

  @Field((type) => String)
  address: string;

  @Field((type) => String)
  ownerName: string;
}
