import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';

import * as LocalSession from 'telegraf-session-local';
import { AppController } from './app.controller';
import { BotModule } from './bot/bot.module';
import { RecordModule } from './record/record.module';
import { UserModule } from './user/user.module';

const session = new LocalSession({ database: 'local_session.json' });

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        middlewares: [session.middleware()],
        token: configService.get('TELEGRAM_BOT_TOKEN'),
        launchOptions: {
          webhook: {
            domain: configService.get('API_URL'),
            hookPath: '/tg-webhook',
          },
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_AUTH_URL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    BotModule,
    RecordModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
