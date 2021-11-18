import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './user.resolver';
import { UsersService } from './user.service';
import { Verification } from './entities/verification.entity';

@Module({
  // .forRoot() 에서 isGlobal: true 로 되어있어서
  // imports 에 ConfigService, JwtService 를 import 해주지 않아도 된다.
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
