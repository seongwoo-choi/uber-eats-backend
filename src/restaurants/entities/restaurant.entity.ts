import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

// InputType, ObjectType, ArgumentType 모두 GraphQL 내부에서 사용될 타입을 지정해주는 어노테이션
// GraphQL 을 위한 Restaurant 의 ObjectType 생성, 자동으로 스키마를 생성되게 해준다.
@InputType({ isAbstract: true })
@ObjectType() // for graphql
@Entity() // for typeorm
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  // Field 어노테이션의 type 은 아무런 의미가 없는 값이다. (), _, type 어떤 것이 와도 상관이 없다.
  // 단지 이 컬럼의 값이 GraphQL 에서 어떤 타입을 갖는지를 나타내주는 것이다.
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => Boolean, { defaultValue: true, nullable: true }) // for graphql
  @Column({ default: true }) // for database
  @IsOptional() // validation for dto
  @IsBoolean() // validation for dto
  isVegan?: boolean;

  @Field((type) => String, { defaultValue: 'default value' })
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field((type) => String)
  @Column()
  @IsString()
  categoryName: string;
}
