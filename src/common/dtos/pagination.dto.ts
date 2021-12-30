import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../dtos/output.dto';

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  totalPage?: number;
}
