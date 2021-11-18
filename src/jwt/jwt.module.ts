import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constant';

@Module({})
@Global() // isGlobal 옵션 활성화
export class JwtModule {
  // fooRoot 는 DynamicModule 값을 반환하고
  // DynamicModule 은 또 다른 모듈을 반환해주는 모듈이다.
  // options 를 어떻게 JwtService 로 보낼 수 있을까? => provider object 를 사용하면 된다.
  static forRoot(options: JwtModuleOptions): DynamicModule {
    // 반환할 모듈 이름을 써주면 된다.
    return {
      module: JwtModule,
      // exports 를 할 경우 어떤 위치에서도 접근이 가능하다.
      // DynamicModule 이 JwtService 를 export 하도록 한다. => users.module 에서도 사용할 수 있도록 함
      exports: [JwtService],
      // 외부에서 DI 할 수 있도록 providers 추가
      // providers: [JwtService] 는 아래와 같은 의미이다. 아래를 함축한 것
      // providers: [
      //   {
      //     provide: JwtService,
      //     useClass: JwtService,
      //   },
      // ],
      // 혹은 아래와 같이 value 를 provide 할 수 있다.
      providers: [
        {
          // CONFIG_OPTIONS 라는 value 를 provide(외부에서 DI 할 수 있다), CONFIG_OPTIONS 의 값은 useValue 로 받은 값을 가진다.
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        // service 를 반드시 포함해줘야 한다.
        JwtService, // == {provide: JwtService, useClass: JwtService}
      ],
    };
  }
}
