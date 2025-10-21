export type ActiveMenuType = {
  email: string;
  label: string;
  chat: string;
};

export type EmailChatType = {
  name: string;
  message: string;
  src: string;
};

export type ComposeLabelType = {
  id: number;
  title: string;
  count?: number;
  color: string;
  value: string;
};

export type ComposeListType = {
  id: number;
  title: string;
  icon: string;
  count?: number;
  value: string;
};

export type EmailMenuListItemsType = {
  src: string;
  email: string;
};

export type EmailMenuItemType = {
  title: string;
  value: string;
  icon: string;
  to?: string;
};

export type MailBoxType = {
  id: number;
  forId: string;
  name: string;
  number: string;
  subject: string;
  teaser: string;
  date: string;
  type: string;
  category: string;
  label: string;
  img: string;
  isStar?: boolean;
  unread?: boolean;
  badge?: string;
  badgeClass?: string;
  isChecked?: boolean;
};
