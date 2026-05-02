export const councilLayout = {
  nodes: [
    { id: 'security-reviewer', position: { x: 0, y: 0 }, data: { label: 'Security Reviewer', sublabel: 'Vulnerabilities' } },
    { id: 'performance-reviewer', position: { x: 250, y: 0 }, data: { label: 'Performance Reviewer', sublabel: 'Optimization' } },
    { id: 'readability-reviewer', position: { x: 500, y: 0 }, data: { label: 'Readability Reviewer', sublabel: 'Code Quality' } },
    { id: 'synthesis', position: { x: 250, y: 180 }, data: { label: 'Synthesis Agent', sublabel: 'Final Verdict' } },
  ],
  edges: [
    { id: 'reviewers-to-synthesis', source: 'security-reviewer', target: 'synthesis' },
    { id: 'perf-to-synthesis', source: 'performance-reviewer', target: 'synthesis' },
    { id: 'read-to-synthesis', source: 'readability-reviewer', target: 'synthesis' },
  ],
}
