import { User } from '../entities/user.entity';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';

// PickType() 을 사용하여 User 엔티티에서 email, password, role 속성만 상속받는다.
@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
