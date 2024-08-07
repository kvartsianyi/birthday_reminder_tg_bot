import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { RecordModule } from '../record/record.module';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { CronService } from './cron.service';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, UserModule, RecordModule],
  providers: [BotUpdate, BotService, CronService],
})
export class BotModule {}
