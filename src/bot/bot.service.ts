import { Injectable } from '@nestjs/common';

import { RecordService } from '../record/record.service';
import { UserService } from '../user/user.service';
import { paginationButtons } from './bot.buttons';
import { Context } from './context.interface';

@Injectable()
export class BotService {
  constructor(
    private readonly userService: UserService,
    private readonly recordService: RecordService,
  ) {}

  private readonly PER_PAGE = 5;

  getTgChatId(ctx: Context): number {
    return (
      ctx.update?.['message']?.from?.id ||
      ctx.update?.['callback_query']?.from?.id
    );
  }

  async getUserCalendarWithPagination(ctx: Context) {
    const page = ctx.session.paginationPage;

    const tgChatId = this.getTgChatId(ctx);

    const user = await this.userService.findOne({ tgChatId });
    const { records, total } = await this.recordService.findAll(
      {
        userId: user._id,
      },
      this.PER_PAGE,
      (page - 1) * this.PER_PAGE,
    );
    const list = await this.recordService.formatList(records);

    return {
      list,
      paginationButtons: paginationButtons({
        hideBack: page <= 1,
        hideNext: page * this.PER_PAGE >= total,
      }),
    };
  }
}
