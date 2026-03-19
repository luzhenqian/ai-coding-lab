import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 原因：单个共享连接实例防止在无服务器环境中连接池耗尽，
// 因为每个请求都会创建一个新的模块作用域
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  // 原因：在无服务器环境（Vercel）中需要设置 prepare 为 false，
  // 因为连接是短暂的，预处理语句无法在不同调用间复用
  prepare: false,
});

export const db = drizzle(client, { schema });
