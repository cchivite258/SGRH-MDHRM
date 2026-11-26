import type { ApiRecordError } from "@/app/common/apiErrors";

export interface ApiErrorResponse {
    status: 'error';
    message: string;
    code?: string;
    detail?: string;
    error: {
      type: string;
      title: string;
      status: number;
      detail?: string;
      instance: string;
      errors?: Record<string, string[]> | ApiRecordError[];
    };
    meta: {
      timestamp: string;
    };
  }
