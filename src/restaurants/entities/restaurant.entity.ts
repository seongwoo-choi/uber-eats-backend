import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';

// InputType, ObjectType, ArgumentType 모두 GraphQL 내부에서 사용될 타입을 지정해주는 어노테이션
// GraphQL 을 위한 Restaurant 의 ObjectType 생성, 자동으로 스키마를 생성되게 해준다.
@InputType({ isAbstract: true })
@ObjectType() // for graphql
@Entity() // for typeorm
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => String, { defaultValue: 'default value' })
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.restaurants)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
