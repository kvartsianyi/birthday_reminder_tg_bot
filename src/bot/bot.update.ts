import {
  Action,
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';

import { Logger } from '@nestjs/common';
import { UserDocument } from 'src/user/user.schema';
import { Telegraf } from 'telegraf';
import { RecordService } from '../record/record.service';
import { UserService } from '../user/user.service';
import {
  ActionButtonActionsEnum,
  actionButtons,
  ActionButtonTitlesEnum,
} from './bot.buttons';
import { BotService } from './bot.service';
import { Context } from './context.interface';

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly userService: UserService,
    private readonly recordService: RecordService,
    private readonly botService: BotService,
  ) {}

  private readonly logger = new Logger(BotUpdate.name);

  @Start()
  async startCommand(ctx: Context) {
    try {
      const from = ctx.update?.['message']?.from;
      const userTgName: string = from?.first_name || from?.username;

      const user = await this.userService.findOne({ tgChatId: from?.id });

      if (!user) {
        await this.userService.createUser({
          tgChatId: from?.id,
          tgNickname: from?.username,
        });
      }

      await ctx.reply(
        `Hello, ${userTgName}👋. What do you want to do?`,
        actionButtons(),
      );
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @Hears(ActionButtonTitlesEnum.LIST)
  async getList(ctx: Context) {
    try {
      ctx.session.paginationPage = 1;

      const { list, paginationButtons } =
        await this.botService.getUserCalendarWithPagination(ctx);

      await ctx.reply(list, paginationButtons);
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @Hears(ActionButtonTitlesEnum.ADD)
  async addToList(ctx: Context) {
    try {
      await ctx.replyWithHTML(
        'Please, write using the folowing format: \n\nEx: <i>Joe Soon - 01.01.2000</i>',
      );
      ctx.session.type = ActionButtonActionsEnum.ADD;
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @Hears(ActionButtonTitlesEnum.REMOVE)
  async removeFromList(ctx: Context) {
    try {
      await ctx.reply('Write the full name:');
      ctx.session.type = ActionButtonActionsEnum.REMOVE;
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @Action('next')
  async pagginationNext(ctx: Context) {
    try {
      ctx.session.paginationPage++;

      const { list, paginationButtons } =
        await this.botService.getUserCalendarWithPagination(ctx);

      await ctx.editMessageText(list, paginationButtons);
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @Action('back')
  async pagginationBack(ctx: Context) {
    try {
      ctx.session.paginationPage--;

      const { list, paginationButtons } =
        await this.botService.getUserCalendarWithPagination(ctx);

      await ctx.editMessageText(list, paginationButtons);
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    try {
      if (!ctx.session.type) return;

      const operation = ctx.session.type;
      ctx.session.type = null;

      const tgChatId = this.botService.getTgChatId(ctx);
      const user = await this.userService.findOne({ tgChatId });

      if (!user) {
        await ctx.reply(
          'Something went wrong🥲 Please try to restart bot with /start commmand',
        );
      }

      switch (operation) {
        case ActionButtonActionsEnum.ADD:
          await this.addCommandHandler(user, message, ctx);
          break;

        case ActionButtonActionsEnum.REMOVE:
          await this.removeCommandHandler(user, message, ctx);
          break;

        default:
          ctx.session.type = null;
          break;
      }
    } catch ({ message, stackTrace }) {
      this.logger.error(message, stackTrace);
    }
  }

  private async addCommandHandler(
    user: UserDocument,
    message: string,
    ctx: Context,
  ): Promise<void> {
    const formatValidator = new RegExp(
      '^[\\p{L}]+(?:\\s[\\p{L}]+)?\\s*-\\s*([0-2][0-9]|3[01])\\.(0[1-9]|1[0-2])\\.\\d{4}$',
      'u',
    );
    if (!formatValidator.test(message)) {
      await ctx.replyWithHTML(
        'Incorrect format. Please see example: \n\nEx: <i>Joe Soon - 01.01.2000</i>',
      );
      return;
    }

    const data = message.trim().split('-');
    const title = data[0].trim();
    const [day, month, year] = data[1].trim().split('.');
    const dateOfBirth = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)),
    );

    await this.recordService.createRecord({
      title,
      userId: user._id,
      dateOfBirth,
    });

    await ctx.reply(`Notification added successfully👌`);
  }

  private async removeCommandHandler(
    user: UserDocument,
    message: string,
    ctx: Context,
  ): Promise<void> {
    const { deletedCount } = await this.recordService.remove(
      user._id,
      message.trim(),
    );

    if (!deletedCount) {
      await ctx.reply('Record for this name does not exist🥲');
      return;
    }

    await ctx.reply(`Notification removed successfully👌`);
  }
}
