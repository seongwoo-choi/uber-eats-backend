import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constant';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

// 기본적으로 ConfigService 랑 같은 형식이 될 것이다.
@Injectable()
export class JwtService {
  // @Inject 를 사용하여 module 에서 무언가를 inject 할 수 있다.
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {
    console.log(options);
  }

  // const token = this.jwtService.sign({id: user.id})
  // sign(payload: object)
  // userId: number 로 특정지어서 받는 이유는 다른 프로젝트와 jwtModule 을 공유하지 않고 userId 만 받아서 토큰화 시켜줄 것이기 때문이다.
  sign(userId: number) {
    console.log(userId);
    // return jwt.sign(payload, this.configService.get('SECRET_KEY'));
    // return jwt.sign(payload, this.options.privateKey);
    // userId + '' -> 문자열로 변환
    return jwt.sign({ id: userId }, this.options.privateKey);
  }

  verify(token: string) {
    // 해독할 때 필요한 secretKey 가 필요하다.
    return jwt.verify(token, this.options.privateKey);
  }
}
