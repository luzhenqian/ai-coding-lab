/**
 * 共享组件变体配置
 *
 * 做什么：定义可复用的组件变体样式，确保整个应用的视觉一致性
 * 为什么：集中管理 neon glow、glass 等特殊效果的样式，避免在每个组件中重复定义
 */

/** 主要操作按钮样式 —— 带 neon glow 效果 */
export const neonButtonClass =
  'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_var(--neon-cyan-glow)] transition-shadow hover:shadow-[0_0_20px_var(--neon-cyan-glow)]'

/** 卡片 glow 效果样式 */
export const glowCardClass =
  'border-border/50 bg-card shadow-[0_0_20px_var(--neon-cyan-glow)] transition-shadow hover:shadow-[0_0_30px_var(--neon-cyan-glow)]'

/** 输入框聚焦 glow 样式 */
export const glowInputClass =
  'bg-input border-border focus-visible:ring-primary focus-visible:shadow-[0_0_8px_var(--neon-cyan-glow)]'

/** 毛玻璃效果样式 */
export const glassClass =
  'bg-card/80 backdrop-blur-sm border-border/50'
