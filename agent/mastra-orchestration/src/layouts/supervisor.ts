export const supervisorLayout = {
  nodes: [
    { id: 'supervisor', position: { x: 250, y: 0 }, data: { label: 'Supervisor', sublabel: '总协调' } },
    { id: 'searchAgent', position: { x: 0, y: 180 }, data: { label: 'Search Agent', sublabel: '搜索信息' } },
    { id: 'analysisAgent', position: { x: 250, y: 180 }, data: { label: 'Analysis Agent', sublabel: '分析数据' } },
    { id: 'writingAgent', position: { x: 500, y: 180 }, data: { label: 'Writing Agent', sublabel: '撰写报告' } },
  ],
  edges: [
    { id: 'supervisor-to-searchAgent', source: 'supervisor', target: 'searchAgent' },
    { id: 'supervisor-to-analysisAgent', source: 'supervisor', target: 'analysisAgent' },
    { id: 'supervisor-to-writingAgent', source: 'supervisor', target: 'writingAgent' },
  ],
}
