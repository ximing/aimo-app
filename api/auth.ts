/**
 * Auth API - 认证相关接口
 * 文档: /docs/api/auth.md
 */

import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
} from "@/types/auth";
import { apiPost, saveToken, saveTokenAsync } from "./common";

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
export const register = async (
  params: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await apiPost<RegisterResponse>("/auth/register", params);

  if (response.code !== 0) {
    throw new Error(response.message || "注册失败");
  }

  return response.data;
};

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
export const login = async (params: LoginRequest): Promise<AuthResponse> => {
  const response = await apiPost<AuthResponse>("/auth/login", params);

  if (response.code !== 0) {
    throw new Error(response.message || "登录失败");
  }

  const { token, user } = response.data;

  if (token) {
    // 同时保存到同步和异步存储
    saveToken(token);
    try {
      await saveTokenAsync(token);
    } catch (err) {
      console.error("Failed to save token asynchronously:", err);
    }
  }

  return response.data;
};
