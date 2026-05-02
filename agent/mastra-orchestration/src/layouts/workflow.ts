export const workflowLayout = {
  nodes: [
    { id: 'writer', position: { x: 0, y: 100 }, data: { label: 'Writer Agent', sublabel: '撰写初稿' } },
    { id: 'seo', position: { x: 250, y: 100 }, data: { label: 'SEO Agent', sublabel: 'SEO 优化' } },
    { id: 'social', position: { x: 500, y: 100 }, data: { label: 'Social Agent', sublabel: '生成社媒文案' } },
  ],
  edges: [
    { id: 'writer-to-seo', source: 'writer', target: 'seo' },
    { id: 'seo-to-social', source: 'seo', target: 'social' },
  ],
}
