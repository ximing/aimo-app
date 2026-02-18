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
 *
 * ⚠️ 诊断提示：
 * - 在 React Native 中，localStorage 可能不可用
 * - 应该使用 getTokenAsync 以获得准确的 token 值
 * - 如果返回 null，说明 token 未被保存或已过期
 */
export const getToken = (): string | null => {
  // 同步版本的降级方案：在初始化时从 AsyncStorage 缓存
  // 实际应该使用 getTokenAsync 以获得准确的值
  try {
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        console.debug("No token found in localStorage");
      }
      return token;
    }
  } catch (e) {
    // 环境不支持 localStorage
    console.warn("localStorage not available:", e);
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
 *
 * 故障排查指南（如果遇到 "JSON Parse error: Unexpected character: <"）：
 *
 * 1️⃣  检查认证状态
 *    - 查看日志是否显示 "✓ Token attached to request"
 *    - 如果显示 "⚠️ WARNING: No token found"，说明 token 未正确保存或过期
 *    - 需要先完成登录流程，确保 token 已保存
 *
 * 2️⃣  验证 FormData 上传
 *    - 确保 isFormData=true 被正确传递
 *    - FormData 的 Content-Type header 应该由浏览器/RN 自动设置
 *    - 不能手动设置 Content-Type，否则会丢失边界符号
 *
 * 3️⃣  检查服务器响应
 *    - 查看日志中的 "Non-JSON response received" 错误消息
 *    - 如果返回 HTML，通常表示 401、404 或 500 错误
 *
 * 4️⃣  常见错误原因
 *    - 401: Token 无效或过期
 *    - 404: 路由不存在
 *    - 500: 服务器错误
 *    - FormData 格式错误
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
  console.log("API Request:", {
    method,
    fullUrl,
    isFormData,
    hasToken: !!tokenToUse,
  });

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    ...headers,
  };
  console.log("requestHeaders", requestHeaders);
  // 添加认证 token
  if (tokenToUse) {
    requestHeaders["Authorization"] = `Bearer ${tokenToUse}`;
    console.log("✓ Token attached to request");
  } else {
    console.warn(
      "⚠️ WARNING: No token found for request - this may cause 401 errors",
    );
  }

  // 设置 Content-Type
  // 重要：FormData 不应该手动设置 Content-Type header，让浏览器/RN 自动处理
  // 手动设置会导致边界符号丢失，导致服务器无法正确解析
  if (!isFormData && method !== "GET") {
    requestHeaders["Content-Type"] = "application/json";
  }
  // 注：FormData 的 Content-Type 由浏览器/React Native 自动设置

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

    // 尝试解析响应为 JSON，如果失败则返回文本
    let data: ApiResponse<T>;
    const contentType = response.headers.get("content-type");

    try {
      // 检查响应是否是 JSON 格式
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // 如果不是 JSON，尝试解析文本（可能是 HTML 错误页面）
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 200));

        // 对于 401，通常是返回 HTML 登录页面
        if (response.status === 401) {
          throw new Error("Authentication failed - please login again");
        }

        throw new Error(
          `Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`,
        );
      }
    } catch (parseError) {
      // JSON 解析失败
      const errorMsg =
        parseError instanceof Error
          ? parseError.message
          : "Failed to parse response";
      console.error("Response parse error:", errorMsg);

      // 对于非 JSON 响应，构建错误响应对象
      data = {
        code: response.status,
        message: errorMsg,
        data: null,
      } as ApiResponse<T>;
    }

    // 如果返回非 OK 状态码
    if (!response.ok) {
      console.error(`HTTP Error ${response.status}:`, data.message);

      // 处理 401 未授权错误
      if (response.status === 401) {
        await handleUnauthorized();
        // 直接抛出认证错误
        throw new Error(data.message || "Authentication failed");
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
 * 支持 Web File、Blob 和 React Native URI
 * 基于表单提交方式（multipart/form-data）
 *
 * @param file - 文件对象：Web File/Blob 或 React Native { uri, type } 对象
 * @param fileName - 文件名称
 * @param additionalFields - 额外的表单字段（如 createdAt）
 * @returns FormData 对象，浏览器/RN 会自动设置 Content-Type: multipart/form-data
 */
export const createFormData = (
  file: File | Blob | { uri: string; type?: string; name?: string },
  fileName: string,
  additionalFields?: Record<string, string | number>,
): FormData => {
  const formData = new FormData();

  // 检查是否是 React Native 的 URI 对象（没有 slice 方法）
  if (typeof file === "object" && "uri" in file && !("slice" in file)) {
    // React Native 的文件对象（来自 ImagePicker 或其他来源）
    // 构建的对象结构会被 fetch 正确处理
    formData.append("file", {
      uri: file.uri,
      type: file.type || "application/octet-stream",
      name: fileName,
    } as any);
  } else {
    // Web 的 File 或 Blob（带有 slice 方法）
    // 第三个参数是文件名，用于 Content-Disposition header
    formData.append("file", file as File | Blob, fileName);
  }

  // 添加额外的表单字段
  // 这些字段会作为 multipart/form-data 的其他部分发送
  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return formData;
};
