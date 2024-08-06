import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Controller()
export class AppController {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Post('/tg-webhook')
  async handleTgWebhook(@Req() req: Request, @Res() res: Response) {
    await this.bot.handleUpdate(req.body, res);
  }
}
