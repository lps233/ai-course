// scripts/multi-turn.mts —— 脱离 UI，手写 messages 跑多轮
// 跑法：node --env-file=.env.local scripts/multi-turn.mts
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const glm = createOpenAI({
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: process.env.GLM_API_KEY,
});

// 用 4.5-air：非推理模型，快。
// 你项目 lib/glm.ts 里现在是 glm-4.7-flash（推理模型，慢 9 倍），脚本演示没必要等那么久
const MODEL = 'glm-4.5-air';

// 步骤 1：手写 messages 跑三轮 node --env-file=.env.local scripts/multi-turn.mts
// 这就是「对话的快照」——全程只靠这一个数组维系记忆
// const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
//   { role: 'user', content: '我叫老王，在学 AI。只回一句话。' },
// ];

// const r1 = streamText({ model: glm.chat(MODEL), messages });
// const t1 = await r1.text;
// console.log('[第1轮·答]', t1);
// // ★ 关键：把模型说的话塞回数组。不 push，下一轮它就忘了自己说过啥
// messages.push({ role: 'assistant', content: t1 });

// async function ask(question: string) {
//   messages.push({ role: 'user', content: question });

//   const result = streamText({ model: glm.chat(MODEL), messages });
//   const text = await result.text;        // ← PromiseLike<string>，必须 await
//   const usage = await result.usage;      // ← 也是 Promise，字段是 inputTokens

//   console.log(`\n[问] ${question}`);
//   console.log(`[答] ${text}`);
//   console.log(`[token] 本次输入 ${usage.inputTokens} / 输出 ${usage.outputTokens}`);

//   messages.push({ role: 'assistant', content: text });
// }

// await ask('我刚才说我叫什么？只回答名字。');
// await ask('那我在学什么？只回答两个字。');

// console.log('\n--- messages 最终有', messages.length, '条 ---');
// console.log(messages.map((m, i) => `${i + 1}. ${m.role}: ${m.content.slice(0, 24)}`).join('\n'));



// 步骤2：反向实验——故意不带历史，看它失忆
// 故意只发这一条，不带任何历史
// const r = await streamText({
//   model: glm.chat(MODEL),
//   messages: [{ role: 'user', content: '我刚才说我叫什么？只回答名字。' }],
// }).text;
// console.log('[不带历史]', r);


// 步骤 3：构造超限场景，看它怎么忘
// ① 先造足够长的废话（要造到接近 10 万 token 量级才明显）
const filler = '这是一段无关紧要的填充文本，用来占用上下文窗口。'.repeat(12000);

const polluted: Array<{ role: 'user' | 'assistant'; content: string }> = [
  { role: 'user', content: '记住：密码是1234。只回答"记住了"。' },
  { role: 'assistant', content: '记住了' },
  { role: 'user', content: filler },
  { role: 'user', content: '我刚才让你记住的密码是？' },
];

const result = streamText({ model: glm.chat(MODEL), messages: polluted });
const text = await result.text;
const usage = await result.usage;
console.log('[污染后回答]', text);
console.log('[本次输入 token]', usage.inputTokens);   // ← 关键：看这个数有多大