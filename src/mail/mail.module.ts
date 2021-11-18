import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constant';
import { MailService } from './mail.service';
import { MailModuleOptions } from './mail.interface';

// Global 로 만들어 놓으면 MailService 를 외부 모듈의 서비스에서 private readonly 로 의존성 주입할 수 있다.
@Global()
@Module({
  providers: [MailService],
})
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: MailService,
          useClass: MailService,
        },
      ],
      exports: [MailService],
    };
  }
}
