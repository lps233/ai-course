// 临时探针2：用需要推理的题目，验证 glm-4.5-air 到底会不会生成 thinking token
// 背景：智谱官方文档称 GLM-4.5 系列是「混合推理模式，默认开启动态思考」
import fs from "node:fs";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const apiKey = fs.readFileSync(".env.local", "utf8").match(/GLM_API_KEY\s*=\s*(.+)/)?.[1]?.trim();
const glm = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
  apiKey,
});

// 一道需要推导的题，逼它进入思考模式
const easy = "今天天气真好";
const hard =
  "书架有3层，第一层比第二层多5本书，第二层比第三层多3本，三层共47本。第三层有几本？请一步步推导。";

for (const [label, prompt] of [["简单", easy], ["需推理", hard]]) {
  for (const model of ["glm-4.5-air"]) {
    const t0 = Date.now();
    try {
      const r = await generateText({
        model: glm.chat(model),
        prompt,
        maxOutputTokens: 900,
      });
      const u = await r.usage;
      console.log(
        JSON.stringify({
          label,
          model,
          ms: Date.now() - t0,
          output: u.outputTokens,
          reasoning: u.outputTokenDetails?.reasoningTokens ?? null,
          textTok: u.outputTokenDetails?.textTokens ?? null,
          reply: r.text.slice(0, 40),
        })
      );
    } catch (e) {
      console.log(JSON.stringify({ label, model, FAILED: String(e).slice(0, 160) }));
    }
  }
}
