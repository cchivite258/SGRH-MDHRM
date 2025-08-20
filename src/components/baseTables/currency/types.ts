export type CurrencyInsertType = {
  id: string;
  name: string;
  symbol: string;
  enabled: boolean;
};

export type CurrencyListingType = {
  id: string;
  name: string;
  symbol: string;
  enabled: boolean;
};

export type CurrencyUpdateType = {
  name?: string;
  symbol?: string;
  enabled: boolean;
};

export type CurrencyResponseType = {
  id: string;
  name: string;
  symbol: string;
  enabled: boolean;
};

export type CurrencyOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};