import { Context as ContextTelegraf } from 'telegraf';

import { ActionButtonActionsEnum } from './bot.buttons';

export interface Context extends ContextTelegraf {
  session: {
    type: ActionButtonActionsEnum;
    paginationPage: number;
  };
}
