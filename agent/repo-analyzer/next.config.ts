import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /** 将原生 Node 模块排除在打包之外，避免 Turbopack 无法解析 .node 文件 */
  serverExternalPackages: ['@mastra/libsql', 'libsql', '@libsql/client', '@libsql/darwin-arm64'],
}

export default nextConfig
