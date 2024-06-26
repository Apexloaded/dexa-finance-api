import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //origin: 'https://dexa.ink',
    origin: "http://localhost:3000"
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  //app.use(express.static(path.join(__dirname,))
  await app.listen(4100);
}
bootstrap();
