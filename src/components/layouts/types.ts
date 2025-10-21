export type SubMenuItemType = {
  label: string;
  link?: string;
  id?: string;
  prefix?: string;
  subMenu?: SubMenuItemType[];
  action?: string;
};

export type MenuItemType = {
  label: string;
  link?: string;
  isHeader?: boolean;
  icon?: string;
  id: string;
  prefix?: string;
  subMenu?: SubMenuItemType[];
  action?: string
};

export type BrandsListType = {
  src: string;
  title: string;
};

export type CartItemType = {
  id: number;
  src: string;
  subTitle: string;
  title: string;
  price: number;
  items: number;
};

export type NotificationType = {
  isSelected: boolean;
  id: string;
  src?: string;
  title?: string;
  message: string;
  icon?: string;
  time: string;
  isRead: boolean;
};
