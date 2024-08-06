import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { RecordService } from 'src/record/record.service';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class CronService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly recordService: RecordService,
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
}
