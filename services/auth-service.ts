/**
 * Authentication Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { Service } from '@rabjs/react';
import { login as apiLogin, register as apiRegister } from '@/api/auth';
import { clearToken, clearTokenAsync } from '@/api/common';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';

class AuthService extends Service {
  // 响应式属性
  user: User | null = null;
  isAuthenticated = false;
  loading = false;
  error: string | null = null;

  /**
   * 用户登录
   */
  async login(params: LoginRequest): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await apiLogin(params);
      this.user = response.user;
      this.isAuthenticated = true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : '登录失败';
      this.isAuthenticated = false;
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 用户注册
   */
  async register(params: RegisterRequest): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await apiRegister(params);
      // 注册成功后需要用户手动登录
    } catch (err) {
      this.error = err instanceof Error ? err.message : '注册失败';
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    this.user = null;
    this.isAuthenticated = false;
    this.error = null;
    clearToken();
    try {
      await clearTokenAsync();
    } catch (err) {
      console.error('Failed to clear token asynchronously:', err);
    }
  }

  /**
   * 清除错误信息
   */
  clearError(): void {
    this.error = null;
  }
}

export default AuthService;
