export type CodeConfigId = string | number;

export type CodeConfigType = "SERVICE_PROVIDER" | "CONTRACT";

export type CodeConfigSeparator =
  | "COMMA"
  | "POINT"
  | "SEMICOLON"
  | "HYPHEN"
  | "SPACE"
  | "NONE";

export type CodeConfigForm = {
  id?: CodeConfigId;
  type: CodeConfigType;
  prefix: string;
  separator: CodeConfigSeparator;
  suffix: string;
  sequenceLength: number | null;
  pattern: string;
  includesYear: boolean;
  includesMonth: boolean;
};

export type CodeConfigListing = CodeConfigForm & {
  id: CodeConfigId;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
};

export type CodeConfigOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};
