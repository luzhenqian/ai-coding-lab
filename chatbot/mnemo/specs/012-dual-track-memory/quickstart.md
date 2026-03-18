# Quickstart: 双轨记忆提取

## 改动概览

本功能改造记忆提取的触发机制，不改变记忆的存储和检索逻辑。

### 修改文件
1. `lib/ai/memory-extractor.ts` — 替换 `shouldTriggerExtraction`，新增 `shouldExtractMemory`（LLM 判断）
2. `lib/ai/prompts.ts` — 新增 `MEMORY_WORTHINESS_PROMPT`
3. `lib/constants.ts` — 移除旧常量，新增空闲超时配置
4. `lib/utils/idle-scheduler.ts` — 新增空闲检测调度器
5. `app/api/chat/route.ts` — 替换提取触发逻辑为双轨方案

### 新增文件
- `lib/utils/idle-scheduler.ts`

### 数据库
无变更。

## 验证步骤

1. 启动开发服务器 `pnpm dev`
2. 发送包含个人信息的消息（如"我在北京工作"），观察服务端日志中是否有 `[memory-extractor] Hot path triggered` 输出
3. 发送闲聊消息（如"你好"），确认日志中没有提取触发
4. 等待 2 分钟不发消息，确认日志中出现 `[memory-extractor] Background extraction triggered`
5. 在 Debug 面板中查看记忆列表，确认有记忆被提取
