import { z } from 'zod'

// ==================== Resume (User Input) ====================

export const resumeSchema = z.object({
  name: z.string(),
  title: z.string(),
  yearsOfExperience: z.number(),
  skills: z.array(z.string()),
  workExperience: z.string(),
  education: z.string(),
})

export type ResumeData = z.infer<typeof resumeSchema>

// ==================== Step 1: JD Parser Output ====================

export const parsedJDSchema = z.object({
  jobTitle: z.string().describe('岗位名称'),
  company: z.string().describe('公司名称'),
  location: z.string().describe('工作地点'),
  salaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).describe('薪资范围（如无法提取则填 0）'),
  experience: z.object({
    yearsMin: z.number(),
    yearsMax: z.number(),
    level: z.string().describe('初级/中级/高级/专家'),
  }).describe('经验要求'),
  requiredSkills: z.array(z.string()).describe('必需技能列表'),
  preferredSkills: z.array(z.string()).describe('加分技能列表'),
  responsibilities: z.array(z.string()).describe('核心职责摘要（3-5 条）'),
  industry: z.string().describe('行业类别'),
})

export type ParsedJD = z.infer<typeof parsedJDSchema>

// ==================== Step 2: Skill Matcher Output ====================

export const skillMatchSchema = z.object({
  overallMatchScore: z.number().min(0).max(100).describe('整体匹配度百分比'),
  matchedSkills: z.array(z.string()).describe('完全匹配的技能'),
  partialMatches: z.array(z.object({
    jdSkill: z.string(),
    userSkill: z.string(),
    reason: z.string(),
  })).describe('部分匹配：JD 技能与用户相关技能的对应关系'),
  missingSkills: z.array(z.string()).describe('完全缺失的技能'),
  extraSkills: z.array(z.string()).describe('用户拥有但 JD 未提及的额外技能'),
})

export type SkillMatch = z.infer<typeof skillMatchSchema>

// ==================== Step 3: Competitiveness Analyzer Output ====================

export const competitivenessSchema = z.object({
  competitivenessLevel: z.enum(['strong', 'moderate', 'needs_improvement']).describe('竞争力等级'),
  strengths: z.array(z.object({
    area: z.string(),
    detail: z.string(),
  })).describe('核心优势'),
  gaps: z.array(z.object({
    area: z.string(),
    severity: z.enum(['critical', 'moderate', 'minor']),
    suggestion: z.string(),
  })).describe('差距分析'),
  salaryPositioning: z.object({
    recommendedRange: z.string(),
    justification: z.string(),
  }).describe('薪资定位建议'),
})

export type CompetitivenessAnalysis = z.infer<typeof competitivenessSchema>

// ==================== Step 4: Strategy Generator Output ====================

export const strategySchema = z.object({
  resumeOptimization: z.array(z.object({
    action: z.string(),
    detail: z.string(),
  })).describe('简历优化建议'),
  interviewPrep: z.object({
    technicalQuestions: z.array(z.string()).describe('可能的技术面试问题'),
    behavioralQuestions: z.array(z.string()).describe('可能的行为面试问题'),
    tips: z.array(z.string()).describe('面试技巧'),
  }).describe('面试准备指南'),
  coverLetterPoints: z.array(z.string()).describe('Cover Letter 要点'),
  skillDevelopmentPlan: z.array(z.object({
    skill: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    resource: z.string(),
  })).describe('技能补强计划'),
})

export type Strategy = z.infer<typeof strategySchema>

// ==================== Combined Analysis (Single Prompt) ====================

export const combinedAnalysisSchema = z.object({
  parsedJD: parsedJDSchema.describe('岗位描述解析结果'),
  skillMatch: skillMatchSchema.describe('技能匹配分析'),
  competitiveness: competitivenessSchema.describe('竞争力分析'),
  strategy: strategySchema.describe('求职策略'),
})

export type CombinedAnalysis = z.infer<typeof combinedAnalysisSchema>

// ==================== Comparison Result ====================

export const comparisonDimensionSchema = z.object({
  name: z.string().describe('维度名称'),
  chainScore: z.number().min(1).max(10).describe('链式模式评分 (1-10)'),
  singleScore: z.number().min(1).max(10).describe('单提示词评分 (1-10)'),
  analysis: z.string().describe('对比分析说明'),
  winner: z.enum(['chain', 'single', 'tie']).describe('该维度胜出方'),
})

export const comparisonSchema = z.object({
  dimensions: z.array(comparisonDimensionSchema).describe('多维度对比评分'),
  consistencyAnalysis: z.string().describe('两种方式结论一致性分析'),
  chainAdvantages: z.array(z.string()).describe('链式模式优势'),
  singleAdvantages: z.array(z.string()).describe('单提示词优势'),
  recommendation: z.string().describe('综合推荐和使用场景建议'),
  overallWinner: z.enum(['chain', 'single', 'tie']).describe('总体胜出方'),
})

export type ComparisonDimension = z.infer<typeof comparisonDimensionSchema>
export type ComparisonResult = z.infer<typeof comparisonSchema>

// ==================== Pipeline State ====================

export type StepStatus = 'pending' | 'running' | 'complete' | 'error' | 'skipped'

export interface StepDebug {
  systemPrompt: string
  userInput: string
  output: string
  durationMs: number
}

export interface PipelineOutputs {
  parsedJD: ParsedJD | null
  skillMatch: SkillMatch | null
  competitiveness: CompetitivenessAnalysis | null
  strategy: Strategy | null
}
