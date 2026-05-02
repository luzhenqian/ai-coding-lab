export const handoffLayout = {
  nodes: [
    { id: 'triage', position: { x: 0, y: 100 }, data: { label: 'Triage Agent', sublabel: '分类路由' } },
    { id: 'tech-support', position: { x: 300, y: 0 }, data: { label: 'Tech Support', sublabel: '技术问题' } },
    { id: 'refund', position: { x: 300, y: 100 }, data: { label: 'Refund Agent', sublabel: '退款处理' } },
    { id: 'billing', position: { x: 300, y: 200 }, data: { label: 'Billing Agent', sublabel: '账单查询' } },
  ],
  edges: [
    { id: 'triage-to-tech-support', source: 'triage', target: 'tech-support' },
    { id: 'triage-to-refund', source: 'triage', target: 'refund' },
    { id: 'triage-to-billing', source: 'triage', target: 'billing' },
  ],
}
