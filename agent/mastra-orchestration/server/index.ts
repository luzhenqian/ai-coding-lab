import express from 'express'
import cors from 'cors'
import { demos } from './demos/index.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/demos', (_req, res) => {
  const list = Object.values(demos).map((d) => d.meta)
  res.json(list)
})

app.post('/api/demos/:id/run', async (req, res) => {
  const demo = demos[req.params.id]
  if (!demo) {
    res.status(404).json({ error: '场景不存在' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const emit: import('./types.js').EmitFn = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  try {
    const result = await demo.run(req.body, emit)
    emit({ type: 'run:complete', result })
  } catch (err) {
    emit({ type: 'node:error', nodeId: 'system', error: String(err) })
  } finally {
    res.end()
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
