/**
 * Standard API Envelopes, Pagination, and Health Status Types
 * Aligned with API.md §1 & §3
 */

export interface IApiResponseMeta {
  timestamp: string;
  version?: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
  meta?: IApiResponseMeta;
  error?: IApiErrorDetail | string | Record<string, unknown>;
}

export interface IApiErrorDetail {
  code: string;
  message: string;
  details?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface IApiErrorResponse {
  success: false;
  error: IApiErrorDetail;
  meta: IApiResponseMeta;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasMore?: boolean;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pagination: IPaginationMeta;
}

export interface IHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  database: {
    connected: boolean;
    type: string;
    latencyMs?: number;
    error?: string;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
}
