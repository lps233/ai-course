// 一次性探针脚本：确认智谱到底有没有把 usage 返回给我们
// 用法：node scripts/probe-usage.mjs
import fs from "node:fs";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const envFile = fs.readFileSync(".env.local", "utf8");
const apiKey = envFile.match(/GLM_API_KEY\s*=\s*(.+)/)?.[1]?.trim();

const glm = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
  apiKey,
});

const r = await generateText({
  model: glm.chat("glm-4.7-flash"),
  prompt: "今天天气真好，我想去公园散步",
});

console.log("回复:", r.text);
console.log("usage:", await r.usage);
console.log("provider 原始元数据:", JSON.stringify(await r.providerMetadata, null, 2));
