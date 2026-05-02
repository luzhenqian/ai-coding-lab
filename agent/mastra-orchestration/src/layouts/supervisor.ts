export const supervisorLayout = {
  nodes: [
    { id: 'supervisor', position: { x: 250, y: 0 }, data: { label: 'Supervisor', sublabel: 'Coordinator' } },
    { id: 'searchAgent', position: { x: 0, y: 180 }, data: { label: 'Search Agent', sublabel: 'Web Search' } },
    { id: 'analysisAgent', position: { x: 250, y: 180 }, data: { label: 'Analysis Agent', sublabel: 'Data Analysis' } },
    { id: 'writingAgent', position: { x: 500, y: 180 }, data: { label: 'Writing Agent', sublabel: 'Report Writing' } },
  ],
  edges: [
    { id: 'supervisor-to-searchAgent', source: 'supervisor', target: 'searchAgent' },
    { id: 'supervisor-to-analysisAgent', source: 'supervisor', target: 'analysisAgent' },
    { id: 'supervisor-to-writingAgent', source: 'supervisor', target: 'writingAgent' },
  ],
}
