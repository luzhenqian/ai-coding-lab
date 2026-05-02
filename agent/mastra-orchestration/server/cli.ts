import 'dotenv/config'
import { demos } from './demos/index.js'
import type { SSEEvent } from './types.js'

const demoId = process.argv[2]
const inputJson = process.argv[3] || '{}'

if (!demoId) {
  console.log('用法：npx tsx server/cli.ts <场景-id> [input-json]')
  console.log('可用场景：', Object.keys(demos).join(', '))
  process.exit(0)
}

const demo = demos[demoId]
if (!demo) {
  console.error(`未知场景：${demoId}`)
  process.exit(1)
}

const input = JSON.parse(inputJson)
const emit = (event: SSEEvent) => {
  const tag = event.type.padEnd(14)
  if (event.type === 'stream:chunk') {
    process.stdout.write(event.text)
  } else if (event.type === 'node:active') {
    console.log(`\n⚡ ${tag} ${event.nodeId}`)
  } else if (event.type === 'node:complete') {
    console.log(`✅ ${tag} ${event.nodeId}`)
  } else if (event.type === 'node:error') {
    console.log(`❌ ${tag} ${event.nodeId}: ${event.error}`)
  } else if (event.type === 'run:complete') {
    console.log(`\n\n=== Result ===`)
    console.log(JSON.stringify(event.result, null, 2))
  }
}

demo.run(input, emit).catch(console.error)
