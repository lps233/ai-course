// day02
import { generateText } from "ai";
// 客户端和模型名抽到 lib/glm.ts：以后换模型只改一个地方
import { glm, MODEL } from "@/lib/glm";

export async function POST(req: Request) {
    const { prompt } = await req.json()

    // generateText = 一口气拿到完整回答（不是打字机，打字机是 Day03 的 streamText）
    const result = await generateText({
        // .chat() 不能省：不加它，SDK v5+ 默认打 /responses，智谱不支持 → 404
        model: glm.chat(MODEL),
        prompt,
    })

    // ⚠️ usage 是 Promise，必须 await。
    // 不 await 你拿到的是 Promise 对象，读 .inputTokens 就是 undefined
    const usage = await result.usage;

    console.log('输入token:', usage.inputTokens);
    console.log('输出token:', usage.outputTokens);
    console.log('总计:', usage.totalTokens);
    // glm-4.7-flash 是推理模型：会先在内部想一大段，思考过程也算钱、也算进窗口
    console.log('其中思考过程:', usage.outputTokenDetails?.reasoningTokens);

    return Response.json({
        text: result.text,
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
        reasoningTokens: usage.outputTokenDetails?.reasoningTokens ?? 0,
    })

}