'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Plus, X, Save } from 'lucide-react'
import type { ResumeData } from '@/lib/schemas'
import { getResume, saveResume } from '@/lib/store'

interface ResumePanelProps {
  resume: ResumeData | null
  onResumeChange: (resume: ResumeData) => void
}

const DEFAULT_RESUME: ResumeData = {
  name: '',
  title: '',
  yearsOfExperience: 0,
  skills: [],
  workExperience: '',
  education: '',
}

const SAMPLE_RESUME: ResumeData = {
  name: '张三',
  title: '前端开发工程师',
  yearsOfExperience: 4,
  skills: [
    'JavaScript', 'TypeScript', 'Vue.js', 'React', 'Node.js',
    'Webpack', 'Git', 'CSS/Sass', 'RESTful API', 'MySQL',
    'Docker', 'Linux', '敏捷开发',
  ],
  workExperience: `2022.03 - 至今 | ABC 科技有限公司 | 前端开发工程师
- 负责公司 SaaS 产品前端开发，使用 Vue 3 + TypeScript 重构核心模块
- 搭建前端监控系统，页面性能提升 40%，错误率下降 60%
- 主导组件库建设，封装 50+ 通用组件，团队开发效率提升 30%

2020.07 - 2022.02 | XYZ 互联网公司 | 初级前端开发
- 参与电商平台前端开发，负责商品详情页、购物车等核心模块
- 使用 React + Redux 开发后台管理系统
- 编写单元测试，代码覆盖率从 30% 提升到 75%`,
  education: `2016.09 - 2020.06 | 某大学 | 计算机科学与技术 | 本科
- GPA 3.5/4.0
- 校级编程竞赛二等奖`,
}

export function ResumePanel({ resume, onResumeChange }: ResumePanelProps) {
  const [form, setForm] = useState<ResumeData>(resume || DEFAULT_RESUME)
  const [skillInput, setSkillInput] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = getResume()
    if (stored) {
      setForm(stored)
      onResumeChange(stored)
    }
  }, [])

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !form.skills.includes(skill)) {
      const updated = { ...form, skills: [...form.skills, skill] }
      setForm(updated)
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) })
  }

  const handleSave = () => {
    saveResume(form)
    onResumeChange(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" />
          我的简历
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">姓名</label>
            <Input
              placeholder="你的名字"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">职位</label>
            <Input
              placeholder="当前职位"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">工作年限</label>
          <Input
            type="number"
            min={0}
            value={form.yearsOfExperience}
            onChange={e => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
            className="mt-1 w-24"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">技能</label>
          <div className="mt-1 flex gap-2">
            <Input
              placeholder="添加技能，回车确认"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {form.skills.length === 0 && (
              <span className="text-xs text-muted-foreground">还没有添加技能</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">工作经历</label>
          <Textarea
            placeholder="简述工作经历..."
            value={form.workExperience}
            onChange={e => setForm({ ...form, workExperience: e.target.value })}
            className="mt-1 min-h-[80px] text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">教育背景</label>
          <Textarea
            placeholder="学历信息..."
            value={form.education}
            onChange={e => setForm({ ...form, education: e.target.value })}
            className="mt-1 min-h-[60px] text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setForm(SAMPLE_RESUME)}
            className="flex-1"
          >
            填入示例
          </Button>
          <Button onClick={handleSave} size="sm" className="flex-1">
            <Save className="h-3.5 w-3.5" />
            {saved ? '已保存' : '保存简历'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
