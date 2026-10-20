import { createOpenAI } from "@ai-sdk/openai";

/**
 * 全局唯一模型名。
 * 想换模型（比如赠额用完后切回 glm-4.5-air）只改这一行，全项目生效。
 */
export const MODEL = "glm-4.5-air";
// export const MODEL = "glm-4.7-flash";

/**
 * 创建一个「指向智谱」的 OpenAI 兼容客户端。
 *
 * 类比前端：
 *   createOpenAI({ baseURL, apiKey })
 *   ≈ axios.create({ baseURL: 'https://open.bigmodel.cn/api/paas/v4', headers: { Authorization: ... } })
 *
 * 为什么要这一步？
 * AI SDK 默认认为你在调 OpenAI 官方。我们要调智谱，所以得告诉它：
 *   - 请求往哪个域名发（baseURL）
 *   - 用什么钥匙（apiKey）
 */
export const glm = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
  // 注意：这里绝对不能加 NEXT_PUBLIC_ 前缀，否则 key 会被打进浏览器包里泄露
  apiKey: process.env.GLM_API_KEY,
});
