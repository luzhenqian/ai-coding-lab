'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Play, Loader2 } from 'lucide-react'

interface JDInputProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  isRunning: boolean
  disabled: boolean
}

const SAMPLE_JD = `高级前端工程师 — 字节跳动

工作地点：北京 / 上海 / 深圳（混合办公）
薪资范围：35K-60K · 15薪

岗位职责：
1. 负责公司核心产品的前端架构设计与开发
2. 优化前端性能，提升用户体验和页面加载速度
3. 参与前端基础设施建设，包括组件库、工具链、CI/CD
4. 与产品、设计、后端团队紧密协作，推动技术方案落地
5. 主导技术选型和代码审查，提升团队整体技术水平

任职要求：
- 5年以上前端开发经验，3年以上 React 项目经验
- 精通 TypeScript，熟悉 React 生态（Next.js、Redux/Zustand）
- 熟悉前端工程化，有 Webpack/Vite 构建优化经验
- 了解 Node.js，有 BFF 或 SSR 开发经验
- 熟悉前端性能优化方法论（Lighthouse、Core Web Vitals）
- 良好的系统设计能力，能独立完成技术方案设计

加分项：
- 有大规模 Monorepo 管理经验（Turborepo/Nx）
- 了解 WebAssembly 或 Rust
- 有开源项目贡献经历
- 有跨端开发经验（React Native / Flutter）`

export function JDInput({ value, onChange, onRun, isRunning, disabled }: JDInputProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          岗位描述（JD）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="粘贴岗位描述文本..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="min-h-[280px] resize-y font-mono text-sm"
          disabled={isRunning}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {value.length} 字符
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(SAMPLE_JD)}
              disabled={isRunning}
            >
              填入示例
            </Button>
            <Button
              size="sm"
              onClick={onRun}
              disabled={disabled || isRunning || !value.trim()}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  开始分析
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
