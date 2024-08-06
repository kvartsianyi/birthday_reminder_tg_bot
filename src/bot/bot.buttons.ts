import { Markup } from 'telegraf';

export enum ActionButtonTitlesEnum {
  LIST = '📅 Show schedule',
  ADD = '✏️ Add notification',
  REMOVE = '✖️ Remove notification',
}

export enum ActionButtonActionsEnum {
  LIST = 'list',
  ADD = 'add',
  REMOVE = 'remove',
}

export const actionButtons = () =>
  Markup.keyboard([
    Markup.button.callback(
      ActionButtonTitlesEnum.LIST,
      ActionButtonActionsEnum.LIST,
    ),
    Markup.button.callback(
      ActionButtonTitlesEnum.ADD,
      ActionButtonActionsEnum.ADD,
    ),
    Markup.button.callback(
      ActionButtonTitlesEnum.REMOVE,
      ActionButtonActionsEnum.REMOVE,
    ),
  ])
    .oneTime()
    .resize();

export const paginationButtons = (
  { hideBack, hideNext } = { hideBack: false, hideNext: false },
) =>
  Markup.inlineKeyboard([
    Markup.button.callback('◀️Back', 'back', hideBack),
    Markup.button.callback('Next▶️', 'next', hideNext),
  ]);
