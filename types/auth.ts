/**
 * Auth API 类型定义
 * 对应文档: /docs/api/auth.md
 */

export interface User {
  uid: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}
