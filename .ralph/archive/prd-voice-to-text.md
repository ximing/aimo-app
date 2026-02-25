# PRD: 录音转文字功能 (Voice-to-Text)

## 简介

实现录音转文字功能，允许用户通过点击底部浮动操作栏的录音按钮进行语音录制，录制完成后自动将音频文件上传并调用 ASR 服务进行语音转文字，最终将转写结果填入新建备忘录页面。

## 目标

- 用户可以通过录音按钮快速录制语音备忘录
- 录音完成后自动上传音频文件并获取 attachmentId
- 调用 ASR 服务异步转写语音为文字
- 转写成功的文本自动填入 create 页面内容区
- 录音文件作为附件保留，与文本一并保存到 memo
- 转写失败时保留录音附件，通过 toast 提示用户转写失败

## 用户故事

### US-001: 实现录音功能
**描述:** 作为用户，我想要点击录音按钮开始录音，并在录音浮层中控制录音的结束。

**验收标准:**
- [ ] 点击 floating-action-bar.tsx 中的录音按钮，显示录音中浮层/弹窗
- [ ] 浮层显示录音状态（录音时长、波形动画或录音中标识）
- [ ] 点击结束录音按钮，停止录音并获取音频文件 URI
- [ ] 使用 expo-av 或 expo-audio 实现录音功能
- [ ] 录音格式为 m4a（iOS/Android 默认）
- [ ] 请求麦克风权限，未授权时提示用户
- [ ] Typecheck/lint passes
- [ ] Verify in browser/simulator using dev-browser skill

### US-002: 创建录音转文字 Service
**描述:** 作为开发者，我需要创建一个 Service 来管理录音转文字的整个流程状态。

**验收标准:**
- [ ] 创建 `services/voice-memo-service.ts`
- [ ] Service 包含状态：recording、audioUri、transcriptionTaskId、transcriptionText、transcriptionStatus
- [ ] 提供 startRecording()、stopRecording() 方法
- [ ] 提供 submitTranscription() 方法，调用 ASR API 提交转写任务
- [ ] 提供 pollTranscriptionStatus() 方法，轮询任务状态
- [ ] 提供 uploadAndTranscribe() 方法，整合上传和转写流程
- [ ] Service 使用 @rabjs/react 的 Service 模式
- [ ] Typecheck/lint passes

### US-003: 实现 ASR API 接口
**描述:** 作为开发者，我需要实现 ASR 相关的 API 接口用于语音转文字。

**验收标准:**
- [ ] 创建 `api/asr.ts`
- [ ] 实现 `submitTranscriptionTask(fileUrls: string[], languageHints?: string[])` 调用 POST /api/v1/asr/transcribe
- [ ] 实现 `getTaskStatus(taskId: string)` 调用 GET /api/v1/asr/task/:taskId
- [ ] 实现 `getTranscriptionResult(taskId: string)` 调用 GET /api/v1/asr/result/:taskId
- [ ] 语言提示固定为 `["zh", "en"]`
- [ ] 正确处理 API 错误响应
- [ ] Typecheck/lint passes

### US-004: 修改 create 页面支持语音创建
**描述:** 作为用户，我结束录音后希望自动跳转到 create 页面，并看到转写的文本和录音附件。

**验收标准:**
- [ ] 修改 `app/(memos)/create.tsx`，支持接收录音文件 URI 和转写文本参数
- [ ] 通过 router params 传递：audioUri、transcriptionText（可选）
- [ ] 进入页面后，如果有 audioUri，自动添加到 selectedMedia 作为音频附件
- [ ] 进入页面后，如果有 transcriptionText，自动填入 content 输入框
- [ ] 显示转写状态（转写中、转写成功、转写失败）
- [ ] 转写失败时 toast 提示 "语音转文字失败，请手动输入"
- [ ] Typecheck/lint passes
- [ ] Verify in browser/simulator using dev-browser skill

### US-005: 实现录音浮层组件
**描述:** 作为用户，我需要一个直观的录音界面来控制录音过程。

**验收标准:**
- [ ] 创建 `components/memos/voice-recorder-modal.tsx`
- [ ] 组件包含：录音按钮（开始/停止）、录音时长显示、取消按钮
- [ ] 录音中显示动画效果（如波形、脉冲动画或录音中红点）
- [ ] 录音时长格式：MM:SS
- [ ] 点击停止录音后，触发回调返回音频文件 URI
- [ ] 支持取消录音操作，关闭浮层不保存录音
- [ ] 使用 @rabjs/react 的 view 装饰器响应主题
- [ ] Typecheck/lint passes
- [ ] Verify in browser/simulator using dev-browser skill

### US-006: 整合录音流程
**描述:** 作为用户，我点击录音按钮后，希望能顺畅地完成从录音到转写的整个流程。

**验收标准:**
- [ ] 修改 `floating-action-bar.tsx`，绑定录音按钮点击事件
- [ ] 点击录音按钮：
  1. 显示 VoiceRecorderModal
  2. 开始录音
  3. 用户点击停止后，关闭浮层
  4. 获取音频 URI，跳转到 create 页面（带 audioUri 参数）
- [ ] create 页面加载后：
  1. 上传音频文件获取 attachmentId
  2. 获取附件详情得到 URL
  3. 调用 ASR transcribe 接口提交转写任务
  4. 轮询 task 状态直到完成
  5. 成功后提取 text 填入 content
  6. 失败时 toast 提示，保留附件
- [ ] Typecheck/lint passes
- [ ] Verify in browser/simulator using dev-browser skill

### US-007: 音频附件预览支持
**描述:** 作为用户，我希望在 create 页面能看到已添加的录音附件。

**验收标准:**
- [ ] 修改 `components/memos/media-preview.tsx`，支持音频类型预览
- [ ] 音频附件显示音频图标、文件名、时长
- [ ] 点击可播放音频（可选，至少显示标识）
- [ ] 支持删除音频附件
- [ ] Typecheck/lint passes
- [ ] Verify in browser/simulator using dev-browser skill

## 功能需求

- FR-1: 点击 floating-action-bar 的录音按钮唤起录音浮层
- FR-2: 录音浮层显示录音时长和录音状态动画
- FR-3: 用户可点击停止结束录音，或点击取消放弃录音
- FR-4: 结束录音后自动跳转到 create 页面，附带音频文件 URI
- FR-5: create 页面接收音频 URI 后自动上传为附件
- FR-6: 上传完成后获取附件 URL，调用 ASR transcribe 接口提交转写任务
- FR-7: 轮询 ASR task 状态接口，直到转写完成或失败
- FR-8: 转写成功后，提取 transcripts[0].text 填入 content 输入框
- FR-9: 转写失败时，toast 提示 "语音转文字失败，请手动输入"，保留录音附件
- FR-10: 语言提示固定为 `["zh", "en"]`
- FR-11: 录音格式使用 m4a
- FR-12: 轮询间隔设置为 2 秒，最多轮询 30 次（60秒超时）

## 非目标（Out of Scope）

- 不实现实时语音识别（流式转写）
- 不实现音频播放功能（仅展示附件）
- 不支持录音暂停/继续
- 不支持多段录音合并
- 不实现 ASR 回调 URL 方式，仅使用轮询

## 设计考虑

- 录音浮层采用居中弹窗或底部抽屉形式
- 录音中状态使用红色脉冲动画或波形图
- 转写状态在 create 页面顶部或内容区上方显示轻量提示
- 使用项目现有的 lucide-react-native 图标库
- 与现有主题系统保持一致

## 技术考虑

- 使用 `expo-av` 实现录音功能（需检查项目是否已安装）
- ASR 接口轮询策略：每 2 秒查询一次，最多 30 次（60秒超时）
- 录音文件临时存储在应用缓存目录
- Service 层管理录音状态和转写流程
- 错误边界处理：网络错误、权限错误、ASR 服务错误

## 成功指标

- 用户可以从点击录音到创建 memo 的流程在 3 步内完成
- 转写成功率 > 90%（网络正常、语音清晰的情况下）
- 录音到转写完成的平均时间 < 录音时长的 2 倍
- 用户对转写失败的感知明确（toast 提示清晰）

## 待解决问题

- 是否需要安装 `expo-av` 或其他录音库？
- create 页面现有的 useMediaPicker hook 是否支持音频类型？
