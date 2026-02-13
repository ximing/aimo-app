/**
 * User API - 用户相关接口
 * 文档: /docs/api/user.md
 */

import { apiGet, apiPut } from './common';
import type { UserInfo, UpdateUserRequest, UpdateUserResponse } from '@/types/user';

/**
 * 获取当前用户信息
 * GET /api/v1/user/info
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await apiGet<UserInfo>('/user/info');

  if (response.code !== 0) {
    throw new Error(response.message || '获取用户信息失败');
  }

  return response.data;
};

/**
 * 更新用户信息
 * PUT /api/v1/user/info
 */
export const updateUserInfo = async (
  params: UpdateUserRequest
): Promise<UserInfo> => {
  const response = await apiPut<UpdateUserResponse>('/user/info', params);

  if (response.code !== 0) {
    throw new Error(response.message || '更新用户信息失败');
  }

  return response.data.user;
};
