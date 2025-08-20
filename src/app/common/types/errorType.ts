export interface ApiErrorResponse {
    status: 'error';
    message: string;
    detail?: string;
    error: {
      type: string;
      title: string;
      status: number;
      detail?: string;
      instance: string;
    };
    meta: {
      timestamp: string;
    };
  }