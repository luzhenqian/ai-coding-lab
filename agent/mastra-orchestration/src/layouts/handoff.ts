export const handoffLayout = {
  nodes: [
    { id: 'triage', position: { x: 0, y: 100 }, data: { label: 'Triage Agent', sublabel: 'Classify' } },
    { id: 'tech-support', position: { x: 300, y: 0 }, data: { label: 'Tech Support', sublabel: 'Technical Issues' } },
    { id: 'refund', position: { x: 300, y: 100 }, data: { label: 'Refund Agent', sublabel: 'Refund Requests' } },
    { id: 'billing', position: { x: 300, y: 200 }, data: { label: 'Billing Agent', sublabel: 'Billing Questions' } },
  ],
  edges: [
    { id: 'triage-to-tech-support', source: 'triage', target: 'tech-support' },
    { id: 'triage-to-refund', source: 'triage', target: 'refund' },
    { id: 'triage-to-billing', source: 'triage', target: 'billing' },
  ],
}
