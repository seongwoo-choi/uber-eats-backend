import { CoreOutput } from '../../common/dto/output.dto';
import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

// user 에서 email, password 를 가지고 class 를 만들고 PartialType 을 사용해서 optional 하게 변경
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
