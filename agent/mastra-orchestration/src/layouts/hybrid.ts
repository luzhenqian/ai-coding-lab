export const hybridLayout = {
  nodes: [
    { id: 'parser', position: { x: 250, y: 0 }, data: { label: 'Resume Parser', sublabel: 'Step 1: Workflow' } },
    { id: 'tech-evaluator', position: { x: 0, y: 150 }, data: { label: 'Tech Skills', sublabel: 'Council' } },
    { id: 'culture-evaluator', position: { x: 250, y: 150 }, data: { label: 'Culture Fit', sublabel: 'Council' } },
    { id: 'growth-evaluator', position: { x: 500, y: 150 }, data: { label: 'Growth Potential', sublabel: 'Council' } },
    { id: 'final-reviewer', position: { x: 250, y: 300 }, data: { label: 'Final Reviewer', sublabel: 'Step 3: Supervisor' } },
    { id: 'clarification', position: { x: 500, y: 300 }, data: { label: 'Clarification', sublabel: 'Sub-agent' } },
  ],
  edges: [
    { id: 'parser-to-council', source: 'parser', target: 'tech-evaluator' },
    { id: 'parser-to-culture', source: 'parser', target: 'culture-evaluator' },
    { id: 'parser-to-growth', source: 'parser', target: 'growth-evaluator' },
    { id: 'council-to-reviewer', source: 'tech-evaluator', target: 'final-reviewer' },
    { id: 'culture-to-reviewer', source: 'culture-evaluator', target: 'final-reviewer' },
    { id: 'growth-to-reviewer', source: 'growth-evaluator', target: 'final-reviewer' },
    { id: 'reviewer-to-clarification', source: 'final-reviewer', target: 'clarification' },
  ],
}
