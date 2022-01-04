import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import {
  Dish,
  DishChoice,
  DishOptions,
} from '../../restaurants/entities/dish.entity';

@InputType('OrderItemOptionInputType')
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  // orderItem entity 는 Dish 에서 어떻게 OrderItem 을 가져올지 신경쓰지 않아도 된다.
  // 양방향 관계를 무조건 할 필요 X, 반대쪽 관계에서 접근을 하고 싶을 때만 해주면 된다.
  @Field(() => Dish)
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(() => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
