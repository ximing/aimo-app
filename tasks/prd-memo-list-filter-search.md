# PRD: Memo 列表筛选与搜索功能优化

## Introduction

优化 Memo 列表页面的筛选和搜索体验，提升用户查找和管理笔记的效率。当前搜索功能较简单，分类筛选缺失，用户难以快速定位需要的笔记。

## Goals

- 提供便捷的多维度筛选功能（分类、排序）
- 重构搜索体验，支持独立搜索页面和高级筛选
- 本地持久化用户的筛选偏好和最近搜索历史
- 保持界面简洁，筛选操作不超过 2 步触达

## User Stories

### US-001: 分类筛选抽屉组件
**Description:** 作为用户，我希望通过侧边栏旁的筛选按钮快速筛选笔记分类，以便快速找到特定分类的笔记。

**Acceptance Criteria:**
- [ ] 在搜索 header 现有侧边栏按钮旁边新增筛选按钮（Filter/Sliders 图标）
- [ ] 点击筛选按钮从右侧滑出筛选抽屉（FilterDrawer）
- [ ] 抽屉内显示分类选择列表，包含：
  - 「全部分类」选项（默认选中，不传 categoryId）
  - 「无分类」选项（传入 categoryId=__uncategorized__，筛选未分类笔记）
  - 用户自定义分类列表（从后端获取）
- [ ] 分类支持单选，选中后立即应用筛选并关闭抽屉
- [ ] 当前选中的分类在 UI 上有明显标识（如勾选图标或高亮背景）
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-002: 排序策略选择
**Description:** 作为用户，我希望调整笔记的排序方式，以便按时间维度查看最新或最早的笔记。

**Acceptance Criteria:**
- [ ] 在筛选抽屉内添加「排序方式」区域
- [ ] 支持按以下维度排序：
  - 创建时间（createdAt）
  - 编辑时间（updatedAt）
- [ ] 每个排序维度支持两种方向：从新到旧（desc）、从旧到新（asc）
- [ ] 使用分段控件（Segmented Control）或按钮组展示排序选项
- [ ] 排序选择后立即应用并刷新列表
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-003: 筛选状态持久化
**Description:** 作为用户，我希望我的筛选和排序偏好被记住，下次打开应用时能恢复上次的设置。

**Acceptance Criteria:**
- [ ] 使用 AsyncStorage 持久化筛选状态
- [ ] 持久化字段包括：selectedCategoryId、sortField、sortOrder
- [ ] 应用启动时从 AsyncStorage 读取并恢复筛选状态
- [ ] 状态变更时自动保存到 AsyncStorage
- [ ] 提供默认状态：全部分类、按创建时间从新到旧排序
- [ ] Typecheck/lint passes

### US-004: 搜索入口改造
**Description:** 作为用户，我希望点击搜索框后跳转到专门的搜索页面，获得更好的搜索体验。

**Acceptance Criteria:**
- [ ] 改造现有搜索 header 中的搜索框，设为只读/禁用输入状态
- [ ] 点击搜索框触发跳转到独立搜索页面 `/search`
- [ ] 搜索框显示占位符文字如「搜索笔记...」
- [ ] 搜索框右侧保留搜索图标
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-005: 搜索页面基础结构
**Description:** 作为用户，我需要一个专门的搜索页面来执行高级搜索操作。

**Acceptance Criteria:**
- [ ] 创建新页面 `app/search.tsx`
- [ ] 页面包含返回按钮，点击返回上一页
- [ ] 页面顶部有搜索输入框（真实可输入）
- [ ] 搜索框自动聚焦，显示软键盘
- [ ] 页面底部/适当位置显示搜索结果列表区域（初始为空状态）
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-006: 最近搜索词功能
**Description:** 作为用户，我希望看到最近的搜索历史，以便快速重新搜索之前的内容。

**Acceptance Criteria:**
- [ ] 使用 AsyncStorage 存储最近搜索词
- [ ] 最多保存 10 条最近搜索记录
- [ ] 新搜索词插入列表顶部，重复词条去重并移至顶部
- - [ ] 在搜索页面搜索框下方显示「最近搜索」区域
- [ ] 每条记录显示搜索关键词和搜索图标
- [ ] 点击最近搜索词立即执行搜索
- [ ] 支持删除单条搜索记录（滑动删除或删除按钮）
- [ ] 提供「清除全部」按钮清空所有历史
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-007: 搜索页面筛选功能
**Description:** 作为用户，我希望在搜索时能通过日期范围和分类进一步精确筛选结果。

**Acceptance Criteria:**
- [ ] 在搜索框下方添加筛选栏，包含两个筛选按钮：
  - 「日期」按钮：点击展开日期范围选择
  - 「分类」按钮：点击展开分类选择（与主页面相同的分类逻辑）
- [ ] 日期范围选项包括：
  - 全部时间（默认）
  - 最近7天
  - 最近30天
  - 自定义范围（使用日期选择器选择起止日期）
- [ ] 筛选条件改变时立即触发搜索（如果已有搜索关键词）
- [ ] 选中的筛选条件在按钮上显示标签（如「7天内」、「工作笔记」）
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-008: 搜索结果展示
**Description:** 作为用户，我希望在搜索页面直接看到搜索结果，以便快速浏览和选择。

**Acceptance Criteria:**
- [ ] 执行搜索后，搜索结果以列表形式显示在当前页面
- [ ] 搜索结果项显示笔记标题、摘要、创建时间和分类标签
- [ ] 点击搜索结果项跳转到笔记详情页
- [ ] 无结果时显示空状态提示（如「未找到相关笔记」）
- [ ] 搜索结果支持分页加载（触底加载更多）
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-009: API 集成
**Description:** 作为开发者，我需要确保前端筛选和搜索参数正确传递给后端 API。

**Acceptance Criteria:**
- [ ] 修改/确认获取 memo 列表的 API 调用，支持传递：
  - `categoryId`: string | undefined（undefined 表示全部分类，`__uncategorized__` 表示无分类）
  - `sortField`: 'createdAt' | 'updatedAt'
  - `sortOrder`: 'asc' | 'desc'
- [ ] 搜索 API 支持传递：
  - `keyword`: string（搜索关键词）
  - `categoryId`: string | undefined
  - `dateRange`: { start: Date, end: Date } | undefined
- [ ] API 调用错误时显示友好的错误提示
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: 筛选按钮位于搜索 header 侧边栏按钮右侧，使用筛选/漏斗图标
- FR-2: 筛选抽屉从右侧滑入，宽度占屏幕 70%-80%，支持点击遮罩或滑动关闭
- FR-3: 分类列表顺序：全部分类 → 无分类 → 用户自定义分类（按创建时间排序）
- FR-4: 排序选项默认选中：按创建时间、从新到旧
- FR-5: 筛选和排序状态使用 AsyncStorage 键名：`memoFilterPrefs`
- FR-6: 最近搜索词使用 AsyncStorage 键名：`recentSearches`，最多 10 条
- FR-7: 搜索页面路由为 `/search`，使用 Expo Router 的 `router.push('/search')` 跳转
- FR-8: 搜索输入框支持提交（键盘搜索按钮或软键盘完成）触发搜索
- FR-9: 日期范围筛选在搜索页面作为筛选条件之一，不影响主页面筛选
- FR-10: 所有筛选变更需触发 memo 列表重新获取

## Non-Goals

- 不支持多选分类（仅支持单选或全部分类）
- 不支持关键词高亮显示在搜索结果中
- 不支持搜索建议/自动补全功能
- 不支持保存/命名常用的筛选组合
- 不支持按标签筛选（仅支持分类）

## Design Considerations

- 筛选抽屉使用与侧边栏（SidebarDrawer）一致的动画风格
- 分类列表项使用 Radio Button 或勾选图标表示选中状态
- 排序选项使用 SegmentedControl（iOS）或 Material Tabs（Android）风格
- 搜索页面采用简洁的白色背景，搜索框使用浅色背景卡片设计
- 最近搜索词使用 Tag/Chip 样式或列表样式展示

## Technical Considerations

- 使用现有的 `@rabjs/react` Service 模式管理筛选状态和搜索状态
- 建议创建 `FilterService` 管理筛选逻辑和持久化
- 建议创建 `SearchService` 管理搜索逻辑和最近搜索历史
- 筛选抽屉组件建议放在 `components/memos/filter-drawer.tsx`
- 搜索页面放在 `app/search.tsx`
- 复用现有的 Memo 列表项组件展示搜索结果
- AsyncStorage 操作使用 `expo-secure-store` 或 `@react-native-async-storage/async-storage`

## Success Metrics

- 用户可以在 2 次点击内完成分类筛选
- 搜索操作响应时间 < 500ms（后端接口响应）
- 筛选偏好恢复成功率 100%（用户重启应用后偏好不丢失）
- 最近搜索词保存和展示成功率 100%

## Open Questions

- 自定义日期范围是否需要同时支持选择开始和结束日期？
- 搜索结果的排序是否跟随主页面的排序设置？
- 是否需要支持清空筛选条件的快捷操作按钮？
