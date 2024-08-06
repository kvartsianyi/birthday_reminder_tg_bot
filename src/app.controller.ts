import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Controller()
export class AppController {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Get()
  async healthStatus(@Req() req: Request, @Res() res: Response) {
    return res.sendStatus(HttpStatus.OK);
  }

  @Post('/tg-webhook')
  async handleTgWebhook(@Req() req: Request, @Res() res: Response) {
    await this.bot.handleUpdate(req.body);
    return res.sendStatus(HttpStatus.OK);
  }
}
