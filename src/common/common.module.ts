import { Global, Module } from '@nestjs/common';
import { PUB_SUB } from './common.constant';
import { PubSub } from 'graphql-subscriptions';

@Module({
  providers: [{ provide: PUB_SUB, useValue: new PubSub() }],
  exports: [PUB_SUB],
})
@Global()
export class CommonModule {}
