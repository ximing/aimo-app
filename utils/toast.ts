/**
 * Toast 提示工具 - 简单的全局 Toast 提示系统
 */

type ToastCallback = (message: string, duration?: number) => void;

let toastCallback: ToastCallback | null = null;

// 注册 Toast 回调（在 App 根组件中调用）
export function registerToastCallback(callback: ToastCallback) {
  toastCallback = callback;
}

// 显示 Toast 提示
export function showToast(message: string, duration: number = 2000) {
  if (toastCallback) {
    toastCallback(message, duration);
  } else {
    // 如果没有注册回调，至少输出到控制台
    console.log("[Toast]", message);
  }
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
