/**
 * 动画工具模块
 *
 * 做什么：提供 framer-motion 动画预设和 reduced-motion 支持
 * 为什么：统一管理动画配置，避免每个组件重复定义动画参数
 */

import type { Variants, Transition } from 'motion/react'
import { useReducedMotion } from 'motion/react'

/**
 * 检测用户是否偏好减少动画
 * 在组件中使用：const prefersReduced = usePreferReducedMotion()
 */
export { useReducedMotion as usePreferReducedMotion }

/** 根据 reduced-motion 偏好返回动画变体或静态变体 */
export function useAnimationVariants(variants: Variants): Variants {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
      exit: { opacity: 1 },
    }
  }
  return variants
}

/** 默认缓动曲线 —— Material Design 标准 ease */
export const ease = [0.4, 0, 0.2, 1] as const

/** 默认过渡配置 */
export const defaultTransition: Transition = {
  duration: 0.25,
  ease,
}

/** 淡入动画 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
  exit: { opacity: 0, transition: { duration: 0.15, ease } },
}

/** 从底部滑入 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease } },
}

/** 从左侧滑入 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: defaultTransition },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15, ease } },
}

/** 缩放淡入 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: defaultTransition },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease } },
}

/** 列表项交错动画 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

/** 列表子项动画 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
}

/** 脉冲发光动画 (CSS keyframe 辅助) */
export const pulseGlow = {
  boxShadow: [
    '0 0 4px rgba(0, 255, 200, 0.2)',
    '0 0 12px rgba(0, 255, 200, 0.4)',
    '0 0 4px rgba(0, 255, 200, 0.2)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}
