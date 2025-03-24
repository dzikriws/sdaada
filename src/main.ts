import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as cors from 'cors';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cors());

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(5000);
}
bootstrap();
