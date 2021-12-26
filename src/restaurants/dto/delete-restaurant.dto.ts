import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dto/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
