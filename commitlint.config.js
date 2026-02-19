module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档变更
        'style',    // 代码格式（不影响功能）
        'refactor', // 代码重构
        'perf',     // 性能优化
        'test',     // 测试相关
        'chore',    // 构建或依赖变更
        'revert',   // 回滚
      ],
    ],
    // type 的大小写
    'type-case': [2, 'always', 'lower-case'],
    // type 不能为空
    'type-empty': [2, 'never'],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // subject 末尾不能是句号
    'subject-full-stop': [2, 'never', '.'],
    // subject 最大长度
    'subject-max-length': [2, 'always', 72],
    // body 最大行宽
    'body-max-line-length': [2, 'always', 100],
    // header 最大长度
    'header-max-length': [2, 'always', 100],
  },
};
