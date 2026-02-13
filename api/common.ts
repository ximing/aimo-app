/**
 * API 通用工具和配置
 * 所有接口的 host 地址为: https://memo.aisoil.fun
 */

import type { ApiRequestOptions, ApiResponse } from "@/types/common";

const API_HOST = "https://memo.aisoil.fun";
const API_VERSION = "/api/v1";
export const BASE_URL = `${API_HOST}${API_VERSION}`;

// Token 存储的 key
const TOKEN_KEY = "aimo_token";

// AsyncStorage 实例（支持跨平台）
let asyncStorage: any = null;

/**
 * 初始化 AsyncStorage（内部使用）
 */
const initAsyncStorage = async () => {
  if (asyncStorage) return;
  try {
    // 动态导入 AsyncStorage，支持 React Native
    const { default: AsyncStorageModule } =
      await import("@react-native-async-storage/async-storage");
    asyncStorage = AsyncStorageModule;
  } catch (e) {
    // 如果在 Web 环境中，使用 localStorage
    if (typeof localStorage !== "undefined") {
      asyncStorage = {
        getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) =>
          Promise.resolve(localStorage.setItem(key, value)),
        removeItem: (key: string) =>
          Promise.resolve(localStorage.removeItem(key)),
      };
    }
  }
};

/**
 * 获取存储的 token（同步版本 - 优先使用 getTokenAsync）
 */
export const getToken = (): string | null => {
  // 同步版本的降级方案：在初始化时从 AsyncStorage 缓存
  // 实际应该使用 getTokenAsync 以获得准确的值
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
  } catch (e) {
    // 环境不支持 localStorage
  }
  return null;
};

/**
 * 异步获取存储的 token（推荐使用）
 */
export const getTokenAsync = async (): Promise<string | null> => {
  try {
    await initAsyncStorage();
    if (asyncStorage) {
      return await asyncStorage.getItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error("Failed to get token:", e);
  }
  return null;
};

/**
 * 保存 token
 */
export const saveToken = (token: string): void => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
    // 异步保存到 AsyncStorage
    initAsyncStorage().then(() => {
      if (asyncStorage) {
        asyncStorage.setItem(TOKEN_KEY, token).catch((e: any) => {
          console.error("Failed to save token:", e);
        });
      }
    });
  } catch (e) {
    // 环境不支持
  }
};

/**
 * 异步保存 token
 */
export const saveTokenAsync = async (token: string): Promise<void> => {
  try {
    await initAsyncStorage();
    if (asyncStorage) {
      await asyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.error("Failed to save token:", e);
  }
};

/**
 * 清除 token
 */
export const clearToken = (): void => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
    // 异步清除 AsyncStorage
    initAsyncStorage().then(() => {
      if (asyncStorage) {
        asyncStorage.removeItem(TOKEN_KEY).catch((e: any) => {
          console.error("Failed to clear token:", e);
        });
      }
    });
  } catch (e) {
    // 环境不支持
  }
};

/**
 * 异步清除 token
 */
export const clearTokenAsync = async (): Promise<void> => {
  try {
    await initAsyncStorage();
    if (asyncStorage) {
      await asyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error("Failed to clear token:", e);
  }
};

// 401 错误回调列表
const unauthorized401Listeners: Array<() => void> = [];

/**
 * 监听 401 未授权错误
 */
export const onUnauthorized = (callback: () => void): (() => void) => {
  unauthorized401Listeners.push(callback);
  // 返回取消监听的函数
  return () => {
    const index = unauthorized401Listeners.indexOf(callback);
    if (index > -1) {
      unauthorized401Listeners.splice(index, 1);
    }
  };
};

/**
 * 触发 401 错误处理
 */
const handleUnauthorized = async (): Promise<void> => {
  // 清除本地 token
  clearToken();
  try {
    await clearTokenAsync();
  } catch (err) {
    console.error("Failed to clear token:", err);
  }
  // 通知所有监听者
  unauthorized401Listeners.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Error in 401 listener:", err);
    }
  });
};

/**
 * 发送 API 请求
 */
export const apiRequest = async <T = any>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> => {
  const {
    method = "GET",
    headers = {},
    body,
    isFormData = false,
    token: customToken,
  } = options;

  // 获取 token
  const tokenToUse = customToken || getToken();

  // 构建完整的 URL
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // 添加认证 token
  if (tokenToUse) {
    requestHeaders["Authorization"] = `Bearer ${tokenToUse}`;
  }

  // 如果不是 FormData，添加 Content-Type
  if (!isFormData && method !== "GET") {
    requestHeaders["Content-Type"] = "application/json";
  }

  // 构建请求体
  let requestBody: any = undefined;
  if (body) {
    requestBody = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: "include", // 包含 Cookie
    });

    const data = await response.json();

    if (!response.ok) {
      // 处理 401 未授权错误
      if (response.status === 401) {
        await handleUnauthorized();
        // 401 错误由 handleUnauthorized 处理，不再继续抛出
        return data as ApiResponse<T>;
      }
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

/**
 * GET 请求
 */
export const apiGet = <T = any>(
  url: string,
  token?: string,
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: "GET", token });
};

/**
 * POST 请求
 */
export const apiPost = <T = any>(
  url: string,
  body?: any,
  isFormData?: boolean,
  token?: string,
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: "POST", body, isFormData, token });
};

/**
 * PUT 请求
 */
export const apiPut = <T = any>(
  url: string,
  body?: any,
  token?: string,
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: "PUT", body, token });
};

/**
 * DELETE 请求
 */
export const apiDelete = <T = any>(
  url: string,
  token?: string,
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: "DELETE", token });
};

/**
 * 上传文件表单数据
 */
export const createFormData = (
  file: File | Blob,
  fileName: string,
  additionalFields?: Record<string, string | number>,
): FormData => {
  const formData = new FormData();
  formData.append("file", file, fileName);

  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return formData;
};
