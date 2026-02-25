# PRD: Memo 标签功能

## Introduction

为笔记应用添加标签（Tag）功能，允许用户通过标签对笔记进行分类和组织。用户可以在创建和编辑笔记时添加标签，在笔记列表中查看标签，以及通过标签筛选笔记。

## Goals

- 在笔记列表中展示每个笔记的标签
- 创建笔记时支持添加已有标签或创建新标签
- 编辑笔记时支持添加、移除标签
- 过滤抽屉中显示标签列表，支持多选筛选
- 多选标签时使用 AND 逻辑（只显示包含所有选中标签的笔记）

## User Stories

### US-001: 笔记列表显示标签
**Description:** 作为用户，我想在笔记列表中看到每个笔记的标签，这样我可以快速识别笔记的类别。

**Acceptance Criteria:**
- [ ] 笔记列表中每条笔记显示其关联的标签
- [ ] 标签使用 Badge 或 Chip 组件展示
- [ ] 多个标签时换行显示或使用更多样式提示
- [ ] Typecheck 通过
- [ ] Verify in browser using dev-browser skill

### US-002: 创建笔记时添加标签
**Description:** 作为用户，我想在创建笔记时添加标签，这样可以组织我的笔记。

**Acceptance Criteria:**
- [ ] 创建笔记页面显示标签选择区域
- [ ] 显示已有标签列表供选择（多选）
- [ ] 支持输入新标签名称并创建
- [ ] 已选择的标签有视觉反馈（如选中状态）
- [ ] 创建笔记时正确调用 API 传递 tags/tagIds
- [ ] Typecheck 通过
- [ ] Verify in browser using dev-browser skill

### US-003: 编辑笔记时管理标签
**Description:** 作为用户，我想在编辑笔记时添加或移除标签。

**Acceptance Criteria:**
- [ ] 编辑笔记页面显示当前笔记的已有标签
- [ ] 可以添加新的标签
- [ ] 可以移除已存在的标签
- [ ] 保存时正确调用 PUT /api/v1/memos/:memoId/tags 更新标签
- [ ] Typecheck 通过
- [ ] Verify in browser using dev-browser skill

### US-004: 过滤抽屉显示标签列表
**Description:** 作为用户，我想在过滤抽屉中看到所有可用标签并筛选笔记。

**Acceptance Criteria:**
- [ ] 过滤抽屉中添加标签筛选区域
- [ ] 显示所有已有标签（调用 GET /api/v1/tags）
- [ ] 标签按名称排序显示
- [ ] 每个标签支持点击切换选中状态
- [ ] 选中状态有视觉反馈
- [ ] Typecheck 通过
- [ ] Verify in browser using dev-browser skill

### US-005: 标签多选筛选逻辑
**Description:** 作为用户，我想通过多个标签筛选笔记，系统使用 AND 逻辑。

**Acceptance Criteria:**
- [ ] 选择多个标签时，使用 AND 逻辑筛选（只显示包含所有选中标签的笔记）
- [ ] 筛选参数正确传递到 GET /api/v1/memos 的 tags 参数（逗号分隔）
- [ ] 清除标签筛选时恢复显示所有笔记
- [ ] Typecheck 通过

### US-006: 标签 Service 层实现
**Description:** 作为开发者，我需要在前端实现标签的 Service 来管理标签状态。

**Acceptance Criteria:**
- [ ] 创建 TagService 类，包含 tags 列表和 loading 状态
- [ ] 实现 fetchTags 方法调用 GET /api/v1/tags
- [ ] 实现 createTag 方法调用 POST /api/v1/tags
- [ ] Service 使用 @rabjs/react 的 Service 模式
- [ ] Typecheck 通过

### US-007: 标签选择组件
**Description:** 作为用户，我想使用一个统一的标签选择组件来选择标签。

**Acceptance Criteria:**
- [ ] 创建 TagSelector 组件
- [ ] 组件接收已选中的标签和 onChange 回调
- [ ] 显示已有标签列表供选择
- [ ] 支持输入新标签名称
- [ ] 支持清除已选标签
- [ ] 组件样式美观，与现有 UI 一致
- [ ] Typecheck 通过
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: 笔记列表返回的数据包含 tags 字段，前端解析并显示在卡片上
- FR-2: 创建笔记表单中添加标签选择区域，支持多选已有标签和创建新标签
- FR-3: 编辑笔记时加载当前笔记的标签，支持添加和移除
- FR-4: 过滤抽屉中添加标签筛选区域，调用 GET /api/v1/tags 获取标签列表
- FR-5: 多选标签时使用 AND 逻辑，通过 tags 参数传递多个标签名称（逗号分隔）
- FR-6: 实现 TagService 用于标签的获取和创建
- FR-7: 创建可复用的 TagSelector 组件

## Non-Goals

- 单独的标签管理页面（标签创建在笔记创建/编辑页面进行）
- 标签的编辑和删除功能（后续迭代）
- 标签颜色自定义功能
- 批量管理标签

## Technical Considerations

- 后端 API 已支持：
  - GET /api/v1/tags - 获取标签列表
  - POST /api/v1/tags - 创建标签
  - GET /api/v1/memos - 支持 ?tags=tag1,tag2 筛选
  - POST /api/v1/memos - 支持 tags/tagIds 参数
  - PUT /api/v1/memos/:memoId/tags - 更新笔记标签
- 前端使用 @rabjs/react 的 Service 模式管理状态
- 复用现有 UI 组件（Badge、Chip、Checkbox 等）
- 过滤状态可通过 URL 参数持久化

## Success Metrics

- 用户可以在 3 次点击内完成添加标签到笔记
- 标签筛选响应时间 < 500ms
- 90% 以上的笔记可以关联至少一个标签

## Open Questions

- 标签数量过多时的展示策略（是否需要分页或搜索）
- 是否需要显示标签使用频率供排序参考
