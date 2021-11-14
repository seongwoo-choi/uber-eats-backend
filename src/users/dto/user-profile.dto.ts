import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  // user 를 찾을 때도 있고 못찾을 때도 있기 때문에 nullable 로 해준다.
  @Field((type) => User, { nullable: true })
  user?: User;
}
