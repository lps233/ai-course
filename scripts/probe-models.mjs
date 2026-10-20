// 临时探针：对比 glm-4.7-flash 与 glm-4.5-air 的 token 结构与耗时
// 用法：node scripts/probe-models.mjs
import fs from "node:fs";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const apiKey = fs.readFileSync(".env.local", "utf8").match(/GLM_API_KEY\s*=\s*(.+)/)?.[1]?.trim();
const glm = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
  apiKey,
});

const prompt = "今天天气真好，我想去公园散步";

for (const model of ["glm-4.7-flash", "glm-4.5-air"]) {
  const t0 = Date.now();
  try {
    const r = await generateText({
      model: glm.chat(model),
      prompt,
      maxOutputTokens: 200,
    });
    const u = await r.usage;
    console.log(
      JSON.stringify({
        model,
        ms: Date.now() - t0,
        input: u.inputTokens,
        output: u.outputTokens,
        reasoning: u.outputTokenDetails?.reasoningTokens ?? null,
        textTok: u.outputTokenDetails?.textTokens ?? null,
        reply: r.text.slice(0, 30),
      })
    );
  } catch (e) {
    console.log(JSON.stringify({ model, FAILED: String(e).slice(0, 200) }));
  }
}
