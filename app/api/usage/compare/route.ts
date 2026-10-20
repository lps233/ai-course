import { generateText } from "ai";
import { glm, MODEL } from "@/lib/glm";

/**
 * POST /api/usage/compare —— Day02 步骤2：同一句话，中文 vs 英文，谁更费 token
 *
 * 可以不传 body（用内置的中英对照句），也可以传：
 *   { "pairs": [{ "zh": "……", "en": "……" }] }
 */
export async function POST(req: Request) {
  // 允许空 body：curl 直接 POST 也能跑
  let body: { pairs?: { zh: string; en: string }[] } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* body 为空就用默认值 */
  }

  // 内置三组对照：短句 / 中句 / 长句。
  // 只测一句容易以偏概全（短句里英文反而更费），多测几组才看得出趋势。
  const pairs = body.pairs ?? [
    {
      zh: "今天天气真好，我想去公园散步",
      en: "The weather is nice today, I want to walk in the park",
    },
    {
      zh: "人工智能正在改变软件的开发方式，前端工程师需要学会把大模型的能力集成到自己的应用里。",
      en: "Artificial intelligence is changing the way software is built, and frontend engineers need to learn how to integrate large model capabilities into their own applications.",
    },
    {
      zh: "在大语言模型的应用开发中，检索增强生成是一种常见的架构模式。它的核心思想是：先根据用户的问题从知识库中检索出相关的文档片段，再把这些片段作为上下文拼进提示词里，让模型基于给定材料作答，从而降低幻觉并提升答案的可追溯性。",
      en: "In the application development of large language models, retrieval-augmented generation is a common architectural pattern. Its core idea is to first retrieve relevant document fragments from a knowledge base according to the user's question, then splice these fragments into the prompt as context, allowing the model to answer based on the given materials, thereby reducing hallucinations and improving the traceability of answers.",
    },
  ];

  const results = [];

  for (const pair of pairs) {
    const row: Record<string, unknown> = { zh: pair.zh, en: pair.en };

    // 同一句话分别用中文、英文问一遍，各记各的账
    for (const [lang, text] of [
      ["zh", pair.zh],
      ["en", pair.en],
    ] as const) {
      try {
        const result = await generateText({
          model: glm.chat(MODEL),
          prompt: text,
          // 我们只关心「这句话被切成几个 token」，不需要它真的回答。
          // 免费模型有并发限制，把输出压到最小 = 更快、更不容易被限流。
          maxOutputTokens: 1,
        });
        const usage = await result.usage;

        // 对比只看 inputTokens：
        // 4.7-flash 是推理模型，输出里混着大量「思考 token」且长度随机，
        // 拿 outputTokens 比中文/英文没有意义。
        const inTok = usage.inputTokens ?? 0;
        row[`${lang}Chars`] = text.length;
        row[`${lang}InputTokens`] = inTok;
        // 关键指标：每个 token 平均扛几个字符。中文≈1，英文≈4，这个比值才稳定
        row[`${lang}CharsPerToken`] = inTok ? +(text.length / inTok).toFixed(2) : 0;
      } catch (e) {
        // 单次失败不能让整批结果全丢（免费模型常被限流）
        row[`${lang}Error`] = e instanceof Error ? e.message.slice(0, 60) : "调用失败";
      }

      // 两次调用之间喘口气，别把免费额度打爆
      await new Promise((r) => setTimeout(r, 1200));
    }

    results.push(row);
  }

  return Response.json({ model: MODEL, results });
}
