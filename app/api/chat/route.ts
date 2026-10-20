// day01

import { streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream, type UIMessage } from "ai";
// 和 /api/usage 共用同一个客户端与模型名
import { glm, MODEL } from "@/lib/glm";

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const result = streamText({
        model: glm.chat(MODEL),
        messages: await convertToModelMessages(messages),
        abortSignal: req.signal, // 客户端取消请求时，模型端也能及时中止生成
    })

    return  createUIMessageStreamResponse({
        stream: toUIMessageStream({stream: result.stream}),
    })
}