/**
 * 通用类型定义
 */

/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 消息响应
 */
export interface MessageResponse {
  message: string;
}

/**
 * === Error Types ===
 */

export enum ErrorCode {
  // 4xx Client Errors
  PARAMS_ERROR = 4001,
  USER_NOT_FOUND = 4004,
  PASSWORD_ERROR = 4010,
  UNAUTHORIZED = 4010,
  USER_ALREADY_EXISTS = 4011,
  UNSUPPORTED_FILE_TYPE = 4018,
  FILE_TOO_LARGE = 4019,
  NOT_FOUND = 4004,
  ATTACHMENT_NOT_FOUND = 4009,

  // 5xx Server Errors
  SYSTEM_ERROR = 5000,
  DB_ERROR = 5001,
  FILE_UPLOAD_ERROR = 5002,
  STORAGE_ERROR = 5003,
}

export interface ApiError {
  code: ErrorCode | number;
  message: string;
  status?: number;
}

/**
 * === Request Options ===
 */

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  isFormData?: boolean;
  token?: string;
}
