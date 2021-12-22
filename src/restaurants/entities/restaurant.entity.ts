import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entities/user.entity';

// InputType, ObjectType, ArgumentType 모두 GraphQL 내부에서 사용될 타입을 지정해주는 어노테이션
// GraphQL 을 위한 Restaurant 의 ObjectType 생성, 자동으로 스키마를 생성되게 해준다.
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType() // for graphql
@Entity() // for typeorm
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String, { defaultValue: '서울시 강남구' })
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  // 카테고리를 지울 때 레스토랑이 지워지지 않게 한다.
  // 카테고리가 없는 레스토랑이 생성될 수 있다.
  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // 유저를 지울 때 레스토랑이 지워지도록 한다.
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;
}
