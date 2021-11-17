import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from '../../common/entities/core.entity';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum, IsString } from 'class-validator';

// UserRole.Owner => 1 이 되고 DB 에 저장이 된다.
enum UserRole {
  'Client',
  'Owner',
  'Delivery',
}

// graphql enum 타입 추가를 위한 작업
// UserRole 이넘 타입을 name 이 UserRole 이라는 이름으로 등록, Field 에서 사용할 수 있도록 함
registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class User extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsEmail()
  email: string;

  // beforeInsert 로 인해 해시화 된 비밀번호가 또 해시화 되서 DB 에 저장되는 것을 방지하기 위해 select: false 를 사용
  @Field((type) => String)
  @Column({ select: false })
  password: string;

  // graphql, db 에서 enum 타입을 사용할 수 있도록 상기 작업들이 필요
  // registerEnumType 으로 인해 UserRole enum 타입을 사용 가능
  @Field((type) => UserRole)
  // DB 에서 enum 타입을 쓸 것이고 UserRole 이라는 데이터를 사용할 것
  @Column({ type: 'enum', enum: UserRole })
  // class-validator 사용
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((type) => Boolean)
  verified: boolean;

  // DB 에 저장하기 전, 즉 Service 에서 this.userRepository.save(this.userRepository.create()) 메서드가 실행하기 전에 아래 메서드가 실행된다.
  // 해당 인스턴스의 password 를 받아서 해시한다.
  @BeforeInsert()
  // DB 에 Update 하기 전, 즉 Service 에서 this.userRepository.update() 메서드가 실행되서 DB 에 업데이트 되기 전에 아래 메서드가 실행된다.
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    // save() 로 전달된 object 에 password 가 있으면 그 때 password 를 해시화한다.
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        // 에러가 발생할 경우 InternalServerErrorException() 을 던지고 이 에러는 Service 단의 try catch 문에서 잡히게 된다.
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
