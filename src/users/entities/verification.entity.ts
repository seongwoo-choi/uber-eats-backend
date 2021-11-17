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

  // user 가 삭제, 업데이트 됐을 때 동작을 지정 가능 -> CASCADE 유저를 삭제하면 user 와 붙어있는 verification 도 같이 삭제한다.
  @OneToOne((type) => User, { onDelete: 'CASCADE' })
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
    // npm i uuid => uuid 로 유니크하고 랜덤한 코드르 사용할 수 있다.
    this.code = uuidv4();
  }
}
