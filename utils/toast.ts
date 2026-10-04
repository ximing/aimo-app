/**
 * Toast 提示工具 - 简单的全局 Toast 提示系统
 */

export type ToastAction = {
  label: string;
  onPress: () => void;
};

export type ToastOptions = {
  message: string;
  duration?: number;
  action?: ToastAction;
};

type ToastCallback = (options: ToastOptions) => void;

let toastCallback: ToastCallback | null = null;

// 注册 Toast 回调（在 App 根组件中调用）
export function registerToastCallback(callback: ToastCallback) {
  toastCallback = callback;
}

function emit(options: ToastOptions) {
  if (toastCallback) {
    toastCallback(options);
  } else {
    console.log("[Toast]", options.message);
  }
}

// 显示 Toast 提示
export function showToast(message: string, duration: number = 2000) {
  emit({ message, duration });
}

// 带操作按钮的提示，例如更新下载完成后的「安装」
export function showToastAction(options: ToastOptions) {
  emit({ duration: 2000, ...options });
}

// 显示成功提示
export function showSuccess(message: string = "成功", duration?: number) {
  showToast(message, duration);
}

// 显示错误提示
export function showError(message: string = "出错了", duration?: number) {
  showToast(message, duration);
}

// 显示信息提示
export function showInfo(message: string = "信息", duration?: number) {
  showToast(message, duration);
}

// 显示警告提示
export function showWarning(message: string = "警告", duration?: number) {
  showToast(message, duration);
}
