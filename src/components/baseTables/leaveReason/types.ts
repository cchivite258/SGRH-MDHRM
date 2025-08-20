export type LeaveReasonInsert = {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  };
  
  export type LeaveReasonListing = {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  };
  
  export type LeaveReasonUpdate = {
    name: string;
    description: string;
    enabled: boolean;
  };

  export type LeaveReasonResponse = {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  };

  export type LeaveReasonOption = {
    page: number;
    itemsPerPage: number;
    sortBy: { key: string; order: 'asc' | 'desc' }[];
    search: string;
  };
  