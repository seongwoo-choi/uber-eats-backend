import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // isGlobal 옵션 => 우리 어플리케이션의 어디서나 config 모듈에 접근할 수 있다.
      isGlobal: true,
      // 폴더에서 .env.dev 파일을 읽는다.
      // process.env.NODE_ENV 파일이 dev 이면 .dev.env 파일을 읽는다.
      envFilePath: process.env.NODE_ENV === 'dev' ? '.dev.env' : '.env.test',
      // .env.test, .env.dev, .production.env 환경을 각각 사용할 것
    }),
    TypeOrmModule.forRoot({
      // connection option 이 들어있다.
      // code 에 직접 쓰거나 ormconfig.json 파일에 작성하는 방법 두 개 존재
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'choi',
      // postgres 에선 로컬호스트로 연결 시 비밀번호를 묻지 않는다.
      password: '0326',
      database: 'uber-eats',
      // typeorm 이 DB에 연결할 때 데이터베이스를 너의 모듈의 현재 상태로 마이그레이션 한다는 뜻
      synchronize: true,
      // 데이터베이스에서 무슨 일이 일어나느지 콘솔에 표시
      logging: false,
    }),
    // setting root module, here forRoot() => root module
    // Apollo server need schema and resolver
    // GraphQLModule is wrapper around Apollo Server => working by Apollo Server!
    // code first & schema first, two solution in document
    // code first, basically a lot of use to power in typescript,
    // and generate schema automatically
    GraphQLModule.forRoot({
      // GraphQLModule looking for Query and Resolver, to generate Schema
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // 메모리로부터 스키마 파일을 만든다. 위와 같이 실제 파일이 생성되지는 않고 메모리 상에 적재된다.
      // 둘 모두 똑같은 의미를 가진다.
      autoSchemaFile: true,
      // localhost:3000/graphql
      playground: true,
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
