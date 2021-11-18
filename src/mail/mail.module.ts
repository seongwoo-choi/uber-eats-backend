import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constant';
import { MailService } from './mail.service';
import { MailModuleOptions } from './mail.interface';

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
