/**
 * 仓库摘要审批卡片
 *
 * 做什么：在 HITL 审批步骤展示仓库基本信息，提供继续/取消按钮
 * 为什么：让用户在 AI 生成报告前确认目标仓库是否正确，
 *        避免浪费资源分析错误的仓库
 */

'use client'

import { motion } from 'motion/react'
import { Star, GitFork, Code2, Scale } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GitHubRepo } from '@/lib/schemas'

interface RepoSummaryCardProps {
  repo: GitHubRepo
  onApprove: () => void
  onCancel: () => void
  loading?: boolean
}

export function RepoSummaryCard({
  repo,
  onApprove,
  onCancel,
  loading = false,
}: RepoSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
    <Card className="max-w-2xl mx-auto border-border/50 bg-card shadow-[0_0_20px_var(--neon-cyan-glow)] hover:shadow-[0_0_30px_var(--neon-cyan-glow)] transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">{repo.fullName}</CardTitle>
        {repo.description && (
          <p className="text-muted-foreground">{repo.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 统计信息网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem icon={Star} label="Stars" value={repo.stars.toLocaleString()} />
          <StatItem icon={GitFork} label="Forks" value={repo.forks.toLocaleString()} />
          <StatItem icon={Code2} label="语言" value={repo.language ?? '未知'} />
          <StatItem icon={Scale} label="许可证" value={repo.license ?? '无'} />
        </div>

        {/* 主题标签 */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="bg-primary/10 text-primary border border-primary/20"
              >
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          onClick={onApprove}
          disabled={loading}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_var(--neon-cyan-glow)]"
        >
          {loading ? '处理中...' : '继续分析'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outline"
          className="border-border text-foreground hover:bg-accent"
        >
          取消
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  )
}

function StatItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-secondary/50 border border-border/50">
      <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  )
}
