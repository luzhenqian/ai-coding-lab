export const councilLayout = {
  nodes: [
    { id: 'security-reviewer', position: { x: 0, y: 0 }, data: { label: 'Security Reviewer', sublabel: '安全漏洞' } },
    { id: 'performance-reviewer', position: { x: 250, y: 0 }, data: { label: 'Performance Reviewer', sublabel: '性能优化' } },
    { id: 'readability-reviewer', position: { x: 500, y: 0 }, data: { label: 'Readability Reviewer', sublabel: '代码质量' } },
    { id: 'synthesis', position: { x: 250, y: 180 }, data: { label: 'Synthesis Agent', sublabel: '综合评审' } },
  ],
  edges: [
    { id: 'reviewers-to-synthesis', source: 'security-reviewer', target: 'synthesis' },
    { id: 'perf-to-synthesis', source: 'performance-reviewer', target: 'synthesis' },
    { id: 'read-to-synthesis', source: 'readability-reviewer', target: 'synthesis' },
  ],
}
