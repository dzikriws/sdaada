import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './config/database.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor';


@Module({
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: TransformResponseInterceptor,
  }],
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UserModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: { target: 'pino-pretty', options: { colorize: true } },
      },
    }),
  ],
})
export class AppModule {}
