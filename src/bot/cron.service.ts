import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { firstValueFrom } from 'rxjs';
import { RecordService } from 'src/record/record.service';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class CronService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly recordService: RecordService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleNotifications(): Promise<number> {
    try {
      const records =
        await this.recordService.findAllRecordsRequireNotification();
      const notificationPromises = records.map(async (record) => {
        try {
          await this.bot.telegram.sendMessage(
            record.user.tgChatId,
            `Today is ${record.title}'s birthday🥳. He is ${record.age} years old.`,
          );
        } catch (e) {
          this.logger.error('Notification error:', e.message);
        }
      });

      const results = await Promise.allSettled(notificationPromises);

      this.logger.log(`Users have been successfully notified.`);

      return results.length;
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async keepServerAlive(): Promise<void> {
    try {
      const API_URL = this.configService.get('API_URL');
      const res = await firstValueFrom(this.httpService.get(API_URL));

      if (res.status === HttpStatus.OK) {
        this.logger.log(`Server's life extended successfully.`);
      } else {
        this.logger.log(`Failed to extend Server's life.`);
      }
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }
}
