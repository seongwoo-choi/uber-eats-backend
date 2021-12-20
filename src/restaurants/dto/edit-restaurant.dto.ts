import { InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantInput } from './create-restaurant.dto';
import { CoreOutput } from '../../common/dto/output.dto';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
