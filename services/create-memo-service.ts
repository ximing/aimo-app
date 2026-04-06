/**
 * Create Memo Service
 * 管理创建/编辑 memo 页面的私有状态与提交流程
 */

import { deleteLocalFile, uploadAttachment } from "@/api/attachment";
import {
  createMemo as apiCreateMemo,
  getMemo as apiGetMemo,
  updateMemo as apiUpdateMemo,
  updateMemoTags as apiUpdateMemoTags,
} from "@/api/memo";
import type { SelectedMedia } from "@/hooks/use-media-picker";
import type { Memo } from "@/types/memo";
import type { TagDto } from "@/types/tag";
import { Service, resolve } from "@rabjs/react";
import MemoService from "./memo-service";

export type CreateMemoSubmitMode = "create" | "edit";

class CreateMemoService extends Service {
  content = "";
  selectedTags: TagDto[] = [];
  selectedCategoryId: string | null = null;
  submitting = false;
  error: string | null = null;
  isLoading = false;
  isEditMode = false;
  audioUri: string | null = null;
  currentMemo: Memo | null = null;

  private get memoService() {
    return resolve(MemoService);
  }

  setContent(content: string): void {
    this.content = content;
  }

  appendContent(extraContent: string): void {
    if (!extraContent) return;
    this.content = this.content ? `${this.content}\n${extraContent}` : extraContent;
  }

  setSelectedTags(tags: TagDto[]): void {
    this.selectedTags = tags;
  }

  setSelectedCategoryId(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
  }

  setAudioUri(uri: string | null): void {
    this.audioUri = uri;
  }

  setError(error: string | null): void {
    this.error = error;
  }

  clearError(): void {
    this.error = null;
  }

  private resetEditState(): void {
    this.currentMemo = null;
    this.content = "";
    this.selectedTags = [];
    this.selectedCategoryId = null;
    this.audioUri = null;
    this.isEditMode = false;
    this.isLoading = false;
    this.submitting = false;
    this.error = null;
  }

  async initEditData(memoId?: string): Promise<void> {
    if (!memoId) {
      this.resetEditState();
      return;
    }

    this.isEditMode = true;
    this.isLoading = true;
    this.error = null;

    try {
      const memo = await apiGetMemo(memoId);
      this.currentMemo = memo;
      this.content = memo.content;
      this.selectedTags = memo.tags || [];
      this.selectedCategoryId = memo.categoryId || null;
    } catch (err) {
      this.error = err instanceof Error ? err.message : "加载数据失败";
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async submitMemo(
    memoId: string | undefined,
    selectedMedia: SelectedMedia[],
  ): Promise<CreateMemoSubmitMode> {
    const memoContent = this.content.trim();
    if (!memoContent) {
      this.error = "请输入内容";
      throw new Error("请输入内容");
    }

    this.submitting = true;
    this.error = null;

    try {
      const attachmentIds: string[] = [];
      for (const media of selectedMedia) {
        const attachment = await uploadAttachment({
          file: { uri: media.uri, type: media.mimeType },
          fileName: media.name,
          createdAt: Date.now(),
        });
        attachmentIds.push(attachment.attachmentId);
      }

      const newTags = this.selectedTags
        .filter((tag) => !tag.tagId)
        .map((tag) => tag.name);
      const existingTagIds = this.selectedTags
        .filter((tag) => !!tag.tagId)
        .map((tag) => tag.tagId as string);

      const hasAudio =
        selectedMedia.some((media) => media.type === "audio") || !!this.audioUri;

      if (this.isEditMode && memoId) {
        await apiUpdateMemo(memoId, {
          content: memoContent,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          categoryId: this.selectedCategoryId || undefined,
        });

        await apiUpdateMemoTags(memoId, {
          tags: newTags.length > 0 ? newTags : undefined,
          tagIds: existingTagIds.length > 0 ? existingTagIds : undefined,
        });

        await this.memoService.refreshMemos();
        return "edit";
      }

      await apiCreateMemo({
        content: memoContent,
        type: hasAudio ? "audio" : "text",
        attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
        tags: newTags.length > 0 ? newTags : undefined,
        tagIds: existingTagIds.length > 0 ? existingTagIds : undefined,
        categoryId: this.selectedCategoryId || undefined,
      });

      if (this.audioUri) {
        await deleteLocalFile(this.audioUri);
        this.audioUri = null;
      }

      await this.memoService.refreshMemos();
      return "create";
    } catch (err) {
      this.error =
        err instanceof Error
          ? err.message
          : this.isEditMode
            ? "编辑失败"
            : "创建失败";
      throw err;
    } finally {
      this.submitting = false;
    }
  }
}

export default CreateMemoService;
