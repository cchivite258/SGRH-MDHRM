export type LanguagesInsert = {
  id: string;
  code: string,
  name: string,
  localizedName: string,
  region: string,
  rtl: boolean
  enabled: boolean;
};

export type LanguagesListing = {
  id: string;
  code: string,
  name: string,
  localizedName: string,
  region: string,
  rtl: boolean,
  enabled: boolean;
};

export type LanguagesUpdate = {
  code: string,
  name: string,
  localizedName: string,
  region: string,
  rtl: boolean,
  enabled: boolean;
};

export type LanguagesResponse = {
  id: string;
  code: string,
  name: string,
  localizedName: string,
  region: string,
  rtl: boolean;
  enabled: boolean;
};

export type LanguagesOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: 'asc' | 'desc' }[];
  search: string;
};
