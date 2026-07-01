export type TableHeaderType = {
  title: string;
  align?: string;
  isCheck?: boolean;
  key?: string;
  sortable?: boolean;
  value?: string;
  width?: string | number;
};

export type DataTableHeaderType = {
  title: string;
  align?: string;
  isCheck?: boolean;
  key?: string;
  sortable?: boolean;
  width?: string | number;
};

export type TableConfigType = {
  page: number;
  start: number;
  end: number;
  noOfItems: number;
  itemsPerPage: number;
};

export type PaginationType = {
  current: number;
  total: number;
  length: number;
};
