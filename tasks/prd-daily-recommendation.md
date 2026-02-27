# PRD: 每日推荐功能

## Introduction

在 memo 首页增加每日推荐模块，展示系统推荐的备忘录和"历史的今天"备忘录。通过横向列表形式呈现，让用户快速发现可能感兴趣的备忘录，同时增加产品趣味性和用户粘性。

## Goals

- 展示 3 条每日推荐备忘录
- 展示"历史的今天"备忘录（数量不定，可能为 0）
- 横向列表展示，推荐和历史混排
- 点击卡片可跳转到对应 memo 详情页
- 不影响原有 memo list 的正常展示和滚动体验

## User Stories

### US-001: 创建每日推荐 API 集成
**Description:** 作为开发者，我需要调用后端 API 获取每日推荐和历史今天数据，以便在前端展示。

**Acceptance Criteria:**
- [ ] 在 `api/` 目录创建 `recommendation.ts` 文件
- [ ] 实现 `getDailyRecommendations()` 函数，调用 `/recommendation/daily` 接口
- [ ] 实现 `getHistoryTodayMemos()` 函数，调用 `/recommendation/history-today` 接口
- [ ] 接口返回数据包含: id, title, content, createdAt, isHistory（区分推荐还是历史）
- [ ] Typecheck 通过

### US-002: 创建推荐数据 Service
**Description:** 作为开发者，我需要创建一个 Service 来管理推荐数据的状态和获取逻辑。

**Acceptance Criteria:**
- [ ] 在 `services/` 目录创建 `recommendation.service.ts`
- [ ] Service 包含属性: recommendations (推荐列表), historyToday (历史今天列表), loading, error
- [ ] 实现 `fetchRecommendations()` 方法获取推荐数据
- [ ] 实现数据刷新逻辑（进入页面时自动获取）
- [ ] Typecheck 通过

### US-003: 在 Memo 首页顶部添加推荐模块
**Description:** 作为用户，我希望在打开 memo 首页时看到推荐模块，了解可能感兴趣的备忘录。

**Acceptance Criteria:**
- [ ] 在 memo list 顶部添加推荐模块区域
- [ ] 区域高度自适应，内容少时紧凑，内容多时可滚动
- [ ] 加载状态显示骨架屏
- [ ] 空状态（无推荐）时隐藏模块，不占用空间
- [ ] Typecheck 通过

### US-004: 横向列表卡片展示
**Description:** 作为用户，我希望推荐内容以横向卡片形式展示，方便浏览。

**Acceptance Criteria:**
- [ ] 横向列表使用 ScrollView/FlatList 横向滚动
- [ ] 每张卡片显示: 标题、日期标签（"推荐" 或 "历史的今天"）
- [ ] 卡片有明显的视觉区分：推荐用蓝色标签，历史用橙色标签
- [ ] 卡片间有适当间距（12-16px）
- [ ] 卡片有圆角和轻微阴影
- [ ] Typecheck 通过

### US-004: 卡片点击跳转详情页
**Description:** 作为用户，我希望点击推荐卡片时能跳转到对应的 memo 详情页。

**Acceptance Criteria:**
- [ ] 点击卡片导航到 `/memos/[id]` 详情页
- [ ] 使用 Expo Router 的 `router.push()` 或 Link 组件
- [ ] 详情页能正常加载并显示 memo 内容
- [ ] Typecheck 通过

### US-005: 推荐模块响应式布局
**Description:** 作为用户，我希望在不同屏幕尺寸下都能良好展示推荐模块。

**Acceptance Criteria:**
- [ ] 在小屏手机（iPhone SE）上卡片宽度适当（约 80% 屏幕宽度）
- [ ] 在大屏手机/平板上卡片宽度适中（约 200-250px）
- [ ] 滚动指示器在移动端可见
- [ ] Typecheck 通过

## Functional Requirements

- FR-1: 调用 `/recommendation/daily` 获取 3 条每日推荐
- FR-2: 调用 `/recommendation/history-today` 获取历史的今天备忘录
- FR-3: 推荐和历史数据混排为一个横向列表，按时间顺序排列
- FR-4: 推荐卡片显示蓝色"推荐"标签，历史卡片显示橙色"历史的今天"标签
- FR-5: 点击卡片跳转到 `/memos/[id]` 详情页
- FR-6: 加载中显示骨架屏，空数据时不显示模块
- FR-7: 推荐模块位于 memo list 顶部，不影响原有列表

## Non-Goals

- 不实现推荐算法的优化或调整
- 不实现推荐数量自定义功能
- 不实现推荐模块的删除或隐藏设置
- 不实现推荐内容的分享功能

## Design Considerations

### 视觉设计

```
┌─────────────────────────────────────────────┐
│  📌 今日推荐                    查看全部 →  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 标题1    │ │ 标题2    │ │ 标题3    │    │
│  │ 推荐     │ │ 历史的   │ │ 推荐     │    │
│  │ 02-24   │ │ 今天     │ │ 02-25   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

- 卡片宽度: 200px
- 卡片间距: 12px
- 卡片圆角: 12px
- 标签颜色: 推荐=#007AFF（蓝色），历史今天=#FF9500（橙色）
- 标题最多显示 2 行，超出省略

### 组件复用

- 复用现有 `Card` 组件或创建 `RecommendationCard` 组件
- 复用现有 Loading 骨架屏组件
- 使用现有导航跳转逻辑

## Technical Considerations

### API 响应格式（预估）

```typescript
// GET /recommendation/daily
interface DailyRecommendation {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: 'recommendation';
}

// GET /recommendation/history-today
interface HistoryTodayMemo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: 'history_today';
}

// 合并后的列表项
interface RecommendationItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: 'recommendation' | 'history_today';
}
```

### 文件结构

```
api/
└── recommendation.ts          # API 函数

services/
└── recommendation.service.ts  # 推荐服务

components/
└── memos/
    ├── recommendation-section.tsx  # 推荐模块容器
    └── recommendation-card.tsx     # 推荐卡片组件
```

## Success Metrics

- 推荐卡片点击率 > 10%
- 页面加载时间增加 < 200ms
- 推荐模块空状态占比 < 20%

## Open Questions

- 推荐列表是否需要缓存？如果需要，缓存策略是什么？
- 历史今天数据过多时（前几年同一天有多条），是否需要限制显示数量？
- 是否需要显示推荐内容的预览摘要？
