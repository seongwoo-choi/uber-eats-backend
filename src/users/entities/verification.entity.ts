import { CoreEntity } from '../../common/entities/core.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User)
  // @Field((type) => User)
  // 외래키를 갖는다. OneToOne 관계를 갖는 엔티티 중 한 곳에서만 JoinColumn 을 사용해야 한다.
  // User 로부터 Verification 에 접근하고 싶다면 JoinColumn 은 User 에 있어야 하고
  // Verification 으로부터 User 에 접근하고 싶다면 JoinColumn 은 Verification 에 있어야 한다.
  @JoinColumn()
  user: User;

  // verification 엔티티에서 code 를 생성하는 이유는 다른 곳에서도 verification 을 생성할 수 있게 하기 위해서
  // createUser, editProfile 에서 verification 을 불러서 쓸 것이다.
  // BeforeInsert => Verification 이 DB 에 저장되기 전에 실행되는 메서드!
  @BeforeInsert()
  createCode(): void {
    // 2 와 36 사이의 숫자를 문자열로 변환 => 랜덤코드
    // const randomCode = Math.random().toString(36).substring(2);
    // npm i uuid => uuid 로 유니크하고 랜덤한 코드르 사용할 수 있다.
    this.code = uuidv4();
  }
}
