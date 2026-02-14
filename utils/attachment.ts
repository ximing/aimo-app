/**
 * 附件工具函数
 * 处理文件类型判断、图标选择、文件名格式化等
 */

/**
 * 文件类型枚举
 */
export type FileType = 'image' | 'video' | 'pdf' | 'doc' | 'excel' | 'zip' | 'audio' | 'other';

/**
 * 根据 MIME 类型判断文件类型
 * @param mimeType - 文件的 MIME 类型（如 "image/png"）
 * @returns 文件类型
 */
export function getFileTypeFromMime(mimeType: string): FileType {
  const mime = mimeType.toLowerCase();

  // 图片类型
  if (mime.startsWith('image/')) {
    return 'image';
  }

  // 视频类型
  if (mime.startsWith('video/')) {
    return 'video';
  }

  // 音频类型
  if (mime.startsWith('audio/')) {
    return 'audio';
  }

  // PDF
  if (mime.includes('pdf')) {
    return 'pdf';
  }

  // Word 文档
  if (
    mime.includes('msword') ||
    mime.includes('wordprocessingml') ||
    mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml')
  ) {
    return 'doc';
  }

  // Excel 文档
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml')
  ) {
    return 'excel';
  }

  // 压缩文件
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('7z') ||
    mime.includes('tar') ||
    mime.includes('gzip')
  ) {
    return 'zip';
  }

  // 其他类型
  return 'other';
}

/**
 * 根据 MIME 类型获取对应的 MaterialIcons 图标名称
 * @param mimeType - 文件的 MIME 类型
 * @returns MaterialIcons 图标名称
 */
export function getFileIcon(mimeType: string): string {
  const fileType = getFileTypeFromMime(mimeType);

  switch (fileType) {
    case 'image':
      return 'image';
    case 'video':
      return 'videocam';
    case 'audio':
      return 'audiotrack';
    case 'pdf':
      return 'picture-as-pdf';
    case 'doc':
      return 'description';
    case 'excel':
      return 'table-chart';
    case 'zip':
      return 'folder-zip';
    default:
      return 'insert-drive-file';
  }
}

/**
 * 格式化文件名，超长时截断并保留扩展名
 * @param filename - 原始文件名
 * @param maxLength - 最大长度（默认 20）
 * @returns 格式化后的文件名
 */
export function formatFileName(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  // 提取文件名和扩展名
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    // 没有扩展名，直接截断
    return filename.substring(0, maxLength - 3) + '...';
  }

  const name = filename.substring(0, lastDotIndex);
  const ext = filename.substring(lastDotIndex);

  // 计算可用于文件名的长度（保留扩展名和省略号）
  const availableLength = maxLength - ext.length - 3;

  if (availableLength <= 0) {
    // 扩展名太长，只显示部分扩展名
    return filename.substring(0, maxLength - 3) + '...';
  }

  return name.substring(0, availableLength) + '...' + ext;
}

/**
 * 判断是否为图片类型
 * @param mimeType - 文件的 MIME 类型
 * @returns 是否为图片
 */
export function isImage(mimeType: string): boolean {
  return getFileTypeFromMime(mimeType) === 'image';
}

/**
 * 判断是否为视频类型
 * @param mimeType - 文件的 MIME 类型
 * @returns 是否为视频
 */
export function isVideo(mimeType: string): boolean {
  return getFileTypeFromMime(mimeType) === 'video';
}

/**
 * 判断是否可以预览（图片或视频）
 * @param mimeType - 文件的 MIME 类型
 * @returns 是否可以预览
 */
export function canPreview(mimeType: string): boolean {
  const fileType = getFileTypeFromMime(mimeType);
  return fileType === 'image' || fileType === 'video';
}
