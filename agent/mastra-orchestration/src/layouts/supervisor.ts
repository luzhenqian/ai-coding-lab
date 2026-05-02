export const supervisorLayout = {
  nodes: [
    { id: 'supervisor', position: { x: 250, y: 0 }, data: { label: 'Supervisor', sublabel: '总协调' } },
    { id: 'search-agent', position: { x: 0, y: 180 }, data: { label: 'Search Agent', sublabel: '搜索信息' } },
    { id: 'analysis-agent', position: { x: 250, y: 180 }, data: { label: 'Analysis Agent', sublabel: '分析数据' } },
    { id: 'writing-agent', position: { x: 500, y: 180 }, data: { label: 'Writing Agent', sublabel: '撰写报告' } },
  ],
  edges: [
    { id: 'supervisor-to-search-agent', source: 'supervisor', target: 'search-agent' },
    { id: 'supervisor-to-analysis-agent', source: 'supervisor', target: 'analysis-agent' },
    { id: 'supervisor-to-writing-agent', source: 'supervisor', target: 'writing-agent' },
  ],
}
