import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // All module integrated by AppModule, like a GraphQL server or Any module
  const app = await NestFactory.create(AppModule);
  // validation-pipeline 생성
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(9090);
}
bootstrap();
