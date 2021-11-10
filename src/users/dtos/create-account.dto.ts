import { User } from '../entites/user.entity';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';

// PickType() 을 사용하여 User 엔티티에서 email, password, role 속성만 상속받는다.
@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput {
  @Field((type) => String, { nullable: true })
  error?: string;

  @Field((type) => Boolean)
  ok: boolean;
}
