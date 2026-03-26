# Claude Skills 实战

从零创建 Claude Skills（技能），让 AI 从通才变专才。写一次规范，无限复用。

## 这是什么

Skill 就是给 Claude 写的 SOP（标准操作流程）。你把写作风格、代码规范、工作流程写成一份说明书，Claude 以后每次都按你的标准来，不用重复交代。

**一个类比：**

- 提示词 = 每次点菜时说的话（"少油少盐多放花生"）
- Skill = 菜谱（写一次，厨师照着做）
- MCP = 厨房设备接口（让厨师能用烤箱、冰箱）

## 目录结构

```
skills/
├── .claude/skills/               # Skill 源文件（Claude Code 自动加载）
│   ├── chinese-blog-writer/      #   Skill 1：中文博客生成器
│   │   └── SKILL.md
│   ├── commit-msg/               #   Skill 2：Git Commit Message 规范化
│   │   └── SKILL.md
│   └── invoice-generator/        #   Skill 3：发票生成器（带脚本）
│       ├── SKILL.md              #     编排者：定义流程和品牌规范
│       ├── scripts/
│       │   └── parse_timesheet.py#     执行者：解析 Excel/CSV 数据
│       └── references/
│           └── brand-config.json #     知识库：品牌配置
│
├── demo_api_with_skill.ts        # TypeScript Demo：通过 API 调用 Skill
├── package.json
├── .env.example                  # 环境变量模板
│
├── packages/                     # 打包好的 zip，可直接上传 Claude AI 网页端
│   ├── chinese-blog-writer.zip
│   ├── commit-msg.zip
│   └── invoice-generator.zip
│
├── prompts/                      # 测试用例 + 测试数据
│   ├── chinese-blog-writer-eval.md
│   ├── commit-msg-eval.md
│   ├── invoice-generator-eval.md
│   └── test-data/
│       ├── timesheet-march.csv
│       ├── timesheet-english.csv
│       ├── invoice-input-simple.md
│       ├── invoice-input-freelancer.md
│       └── invoice-input-multi-item.md
│
└── README.md
```

## 三个 Skill 详解

### 1. 中文博客生成器（chinese-blog-writer）

**模式：** 输出标准化型

给一个主题和要点，生成风格统一、结构规范的中文技术博客。

- 固定文章结构：引言 → 核心概念 → 实战演示 → 踩坑记录 → 总结
- 写作风格：对话式，每段不超过 4 行，专业术语附英文原文
- 代码规范：标注语言类型，关键行加中文注释，完整可运行

### 2. Git Commit Message 规范化（commit-msg）

**模式：** 流程编排型

分析 `git diff --staged`，自动生成符合 Conventional Commits 规范的 commit message。

- 设置了 `disable_model_invocation: true`——只能手动用 `/commit-msg` 调用
- 会判断提交是否过大（超过 5 个文件或 300 行），建议拆分
- 自动适配中英文风格（参考最近的 commit 历史）

### 3. 发票生成器（invoice-generator）

**模式：** 脚本增强型

从 Excel 工时表或手动输入生成专业发票。

- SKILL.md 编排整个工作流（输入 → 校验 → 计算 → 生成 → 输出）
- Python 脚本处理 Excel/CSV 数据解析
- `brand-config.json` 存储品牌配置（颜色、字体、税率等）

## 使用方式

### 方式一：Claude AI 网页端

直接上传打包好的 zip 文件：

1. 打开 [claude.ai](https://claude.ai)
2. 进入设置 → Skills
3. 上传 `packages/` 目录下的 zip 文件（如 `chinese-blog-writer.zip`）
4. 新建对话，正常提问即可——Claude 会自动识别并调用相关 skill

### 方式二：Claude Code 命令行

Skill 已放在 `.claude/skills/` 目录下，Claude Code 会自动加载：

```bash
# 自动触发——Claude 判断任务相关时自动使用
> 帮我写一篇关于 Docker 的技术博客

# 手动调用——用斜杠命令精确触发
> /chinese-blog-writer
> /commit-msg
> /invoice-generator
```

### 方式三：通过 Anthropic API

核心思路：**读取 SKILL.md 文件，注入到 API 的 `system` 参数中**。

```bash
# 安装依赖
cd skills
npm install

# 设置 API Key（在 .env 文件中配置）
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key

# 运行 Demo
npm run demo
```

Demo 脚本 `demo_api_with_skill.ts` 包含 4 个示例（全部流式输出）：

| 示例 | 功能 | 核心知识点 |
|------|------|-----------|
| `demoBasic()` | 基础调用 | system prompt 注入 skill、流式输出 |
| `demoMultiSkill()` | 多 skill 组合 | 同时加载多个 skill |
| `demoCaching()` | Prompt Caching | `cache_control` 节省 90% 成本 |
| `demoMultiTurn()` | 多轮对话 | 无状态 API + 对话历史管理 |

取消 `main()` 函数中对应示例的注释即可运行。

## 测试 Skill 触发率

每个 skill 都配有 20 条测试用例（10 条应触发 + 10 条不应触发），在 `prompts/` 目录下：

```bash
prompts/
├── chinese-blog-writer-eval.md   # 博客生成器测试
├── commit-msg-eval.md            # Commit Message 测试
└── invoice-generator-eval.md     # 发票生成器测试
```

将测试用例逐条输入 Claude，检查 skill 是否正确触发。如果触发率不理想，调整 SKILL.md 中 `description` 字段的措辞。

## Skill 编写要点

| 要点 | 说明 |
|------|------|
| `description` 决定触发率 | 用第三人称，写明"做什么"和"什么时候用"，覆盖同义词 |
| 正文控制在 500 行以内 | 详细内容拆到 `references/` 目录，按需加载 |
| 不要硬编码敏感信息 | API Key、密码等用环境变量或 MCP 处理 |
| 有副作用的操作加保护 | 设置 `disable_model_invocation: true`，防止自动执行 |
| 多个小 skill 优于一个大 skill | 聚焦的小 skill 会自动组合使用 |
