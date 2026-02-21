---
ruleType: Always
---

# View 层调用 Service 方法的规范

## 核心原则

Service 方法会自动 bind this，可以直接传递给 React 组件的回调属性（如 `onPress`、`onChangeText` 等），无需在 View 层使用 `useCallback` 包装。

## 实践示例

### ❌ 不推荐：View 层过度封装

```typescript
// search.tsx (View 层)
// 大量冗余的 useCallback 包装
const handleSearch = useCallback(async (keyword: string) => {
  if (!keyword.trim()) return;
  await searchService.search(keyword);
}, [searchService]);

const handleSubmitEditing = useCallback(() => {
  if (searchService.searchKeyword.trim()) {
    handleSearch(searchService.searchKeyword);
  }
}, [searchService.searchKeyword, handleSearch]);

const handleClear = useCallback(() => {
  searchService.setSearchKeyword("");
  inputRef.current?.focus();
}, [searchService]);

// JSX 中使用
<TextInput
  onChangeText={handleKeywordChange}
  onSubmitEditing={handleSubmitEditing}
/>
<TouchableOpacity onPress={handleClear} />
```

### ✅ 推荐：直接在 Service 层封装业务逻辑

**Service 层 (search-service.ts)：**

```typescript
class SearchService extends Service {
  searchKeyword = "";

  // 设置搜索关键词
  setSearchKeyword(keyword: string): void {
    this.searchKeyword = keyword;
  }

  // 提交当前关键词搜索（用于 TextInput onSubmitEditing）
  async submitSearch(): Promise<void> {
    if (this.searchKeyword.trim()) {
      await this.search(this.searchKeyword);
    }
  }

  // 从最近搜索点击进行搜索
  async searchFromRecent(keyword: string): Promise<void> {
    this.searchKeyword = keyword;
    await this.search(keyword);
  }

  // 更新筛选并触发搜索
  async updateDateFilter(dateRange?: DateRange): Promise<void> {
    this.searchFilters = { ...this.searchFilters, dateRange };
    if (this.searchKeyword.trim()) {
      await this.search(this.searchKeyword, this.searchFilters);
    }
  }

  // 加载更多
  async loadMore(): Promise<void> {
    if (this.hasMore && !this.isSearching && this.searchKeyword) {
      await this.loadNextPage();
    }
  }
}
```

**View 层 (search.tsx)：**

```typescript
// 直接使用 service 方法，无需 useCallback
<TextInput
  value={searchService.searchKeyword}
  onChangeText={searchService.setSearchKeyword}
  onSubmitEditing={searchService.submitSearch}
/>

// 最近搜索 Tag 点击
<TouchableOpacity onPress={searchService.searchFromRecent} />

// 清除全部
<TouchableOpacity onPress={searchService.clearRecentSearches} />

// 下拉刷新
<FlatList onRefresh={searchService.submitSearch} />

// 加载更多
<FlatList onEndReached={searchService.loadMore} />
```

## 规则总结

1. **Service 层**：将业务逻辑封装成完整的方法，方法内部处理所有相关状态和副作用
2. **View 层**：直接传递 `searchService.methodName` 给 React 组件的回调属性
3. **保留必要回调**：仅在 View 层保留无法封装到 Service 的逻辑，如：
   - 需要访问 router 的导航操作 (`router.back()`)
   - 需要操作 DOM/Ref 的逻辑 (`inputRef.current?.focus()`)
   - 临时 UI 状态（与业务无关的本地状态）

## 优势

- 大幅减少 View 层代码量
- 业务逻辑集中在 Service 层，便于维护和测试
- 避免不必要的 `useCallback` 闭包问题
- Service 方法自动 bind this，可直接作为回调传递
