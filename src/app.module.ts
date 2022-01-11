import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';

console.log(process.env.NODE_ENV);
// process.env.NODE_ENV 에 강제적으로 타입을 지정 가능하다.
// process.env.NODE_ENV =
//   process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'prod'
//     ? 'prod'
//     : 'dev';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      // isGlobal 옵션 => 어플리케이션의 어디서나 config 모듈에 접근할 수 있다.
      isGlobal: true,
      // 폴더에서 .env.dev 파일을 읽는다.
      // .env.test, .env.dev, .production.env 환경을 각각 사용할 것
      // process.env.NODE_ENV 파일이 dev 이면 .env.dev 파일을 읽는다.
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      // envFilePath: '.env.dev',
      // 서버에 배포할 때 환경변수 파일을 사용하지 않겠다.
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      // 환경변수 파일에 대한 유효성 검사를 실시
      validationSchema: Joi.object({
        // required() => 필수값
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      // connection option 이 들어있다.
      // code 에 직접 쓰거나 ormconfig.json 파일에 작성하는 방법 두 개 존재
      type: 'postgres',
      host: process.env.DB_HOST,
      // parseInt(process.env.DB_PORT)
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      // postgres 에선 로컬호스트로 연결 시 비밀번호를 묻지 않는다.
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // typeorm 이 DB에 연결할 때 데이터베이스를 너의 모듈의 현재 상태로 마이그레이션 한다는 뜻
      // graphQL 에서 사용하는 스키마를 자동으로 생성해주고 DB 에도 자동으로 즉시 반영해준다.
      synchronize: process.env.NODE_ENV !== 'prod',
      // 데이터베이스에서 무슨 일이 일어나는지 콘솔에 표시
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      // TypeORM 이 DB 에 Restaurant entity 를 테이블 수 있도록 등록
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
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
      autoSchemaFile: process.env.NODE_ENV !== 'prod',
      installSubscriptionHandlers: true,

      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any) => ({
            token: connectionParams['X-JWT'],
          }),
        },
      },

      // graphql module context 옵션 안에 request property 가 있다.
      // 어떤 걸 return 하던지 그 값을 모든 resolver 에서 공유할 수 있다.
      context: ({ req }) => {
        const TOKEN_KEY = 'x-jwt';
        if (req) {
          return { token: req.headers[TOKEN_KEY] };
        }
      },
    }),
    UsersModule,
    RestaurantsModule,
    AuthModule,
    JwtModule.forRoot({
      privateKey: process.env.SECRET_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    OrdersModule,
    CommonModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
// MiddleWare 를 설치하기 위해 NestModule 을 상속받는다.
export class AppModule {}
