import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from '../../common/dto/output.dto';
import { User } from '../entities/user.entity';

// token 을 리턴한다.
@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field((type) => String, { nullable: true })
  token?: string;
}

// PickType 을 사용하여서 @InputType 으로 작성
// User 에서 email, password 필드를 가져온다.
@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
