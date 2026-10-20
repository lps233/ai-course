import { generateText } from 'ai';
import { glm, MODEL } from '../lib/glm.ts';

// for (const temperature of [0, 0.7, 1.0]) {
//   const out: string[] = [];
//   for (let i = 0; i < 3; i++) {
//     const { text } = await generateText({
//       model: glm.chat(MODEL),
//       temperature,
//       maxOutputTokens: 2048, // 智谱是推理模型，不加会被思考吃掉输出
//       prompt: '用一句话给「闭包」下个定义',
//     });
//     out.push(text.slice(0, 20));
//   }
//   console.log(`temp=${temperature} ->`, out);
// }


// // 2-gram 字符集合 + Jaccard 相似度（交集 ÷ 并集）
// const bigrams = (s: string) => { const g = new Set<string>(), c = s.replace(/\s/g, ''); for (let i = 0; i < c.length - 1; i++) g.add(c.slice(i, i + 2)); return g; };
// const jaccard = (a: Set<string>, b: Set<string>) => { const inter = [...a].filter(x => b.has(x)).length, uni = new Set([...a, ...b]).size; return uni ? inter / uni : 0; };

// const task = '写一个大约80字的微型科幻故事开头，主角是一个程序员，他发现自己每天都在重复同一天。只写故事，不要解释。';

// for (const temperature of [0, 0.5, 1.0]) {
//   const outs: string[] = [];
//   for (let i = 0; i < 10; i++) {
//     const { text } = await generateText({
//       model: glm.chat(MODEL),
//       temperature,
//       maxOutputTokens: 1024,
//       prompt: task,
//     });
//     outs.push(text.trim());
//   }
//   const sets = outs.map(bigrams);
//   const sims: number[] = [];
//   for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) sims.push(jaccard(sets[i], sets[j]));
//   const avg = sims.reduce((a, b) => a + b, 0) / sims.length;
//   console.log(`temp=${temperature} | 相似度 ${(avg * 100).toFixed(1)}% | 去重 ${new Set(outs).size}/10 种`);
// }



const presets = {
  code:     { temperature: 0.2, topP: 0.9,  maxOutputTokens: 1024 },
  creative: { temperature: 1.0, topP: 0.95, maxOutputTokens: 1024 }, // 512 对推理模型偏小，已改
  chat:     { temperature: 0.7, topP: 0.9,  maxOutputTokens: 2048 },
} as const;

const prompt = '给一个「用自然语言查数据库」的 AI 工具起 3 个名字，每个配一句 slogan。只输出名字和 slogan。';

for (const task of ['code', 'chat', 'creative'] as const) {
  const { text, finishReason } = await generateText({
    model: glm.chat(MODEL),
    ...presets[task], // 按任务查表取参——这就是「工程化」
    prompt,
  });
  console.log(`\n=== ${task} 档 | temp=${presets[task].temperature} | finish=${finishReason} ===`);
  console.log(text.trim());
}
