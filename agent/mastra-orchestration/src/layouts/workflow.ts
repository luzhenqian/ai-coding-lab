export const workflowLayout = {
  nodes: [
    { id: 'writer', position: { x: 0, y: 100 }, data: { label: 'Writer Agent', sublabel: 'Draft Article' } },
    { id: 'seo', position: { x: 250, y: 100 }, data: { label: 'SEO Agent', sublabel: 'Optimize' } },
    { id: 'social', position: { x: 500, y: 100 }, data: { label: 'Social Agent', sublabel: 'Generate Posts' } },
  ],
  edges: [
    { id: 'writer-to-seo', source: 'writer', target: 'seo' },
    { id: 'seo-to-social', source: 'seo', target: 'social' },
  ],
}
