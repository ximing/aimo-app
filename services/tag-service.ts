/**
 * Tag Service
 * 使用 @rabjs/react 进行响应式状态管理
 */

import { createTag as apiCreateTag, getTags as apiGetTags } from "@/api/tag";
import type { TagDto } from "@/types/tag";
import { Service } from "@rabjs/react";

class TagService extends Service {
  // 响应式属性
  tags: TagDto[] = [];
  loading = false;
  error: string | null = null;

  /**
   * 获取标签列表
   */
  async fetchTags(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const tags = await apiGetTags();
      this.tags = tags;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "获取标签列表失败";
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 创建标签
   */
  async createTag(name: string): Promise<TagDto> {
    this.loading = true;
    this.error = null;

    try {
      const tag = await apiCreateTag({ name });
      // 添加到列表中
      this.tags = [...this.tags, tag];
      return tag;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "创建标签失败";
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * 清除错误信息
   */
  clearError(): void {
    this.error = null;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.tags = [];
    this.loading = false;
    this.error = null;
  }
}

export default TagService;
