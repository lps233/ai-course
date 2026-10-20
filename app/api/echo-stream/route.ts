// day03

export async function POST(req: Request) {
  const { text } = await req.json();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
     for(const ch of text) {
        controller.enqueue(encoder.encode(ch));

        // 这就是「背压」信号：≤ 0 表示下游消费不过来了，该暂停生产
        // if(controller.desiredSize !== null && controller.desiredSize <= 0) {}

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      controller.close(); // 忘了这行，前端 read() 会永远挂着
    }
  })

  // 是new Response(stream, ...) 而不是 `Response.json(...)。
  // 后者会把整个 body 一次性序列化完再发，前端 res.body 拿到的一块就是全部——那就等于没流式。
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",  
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no', // nginx 反向代理时，禁止缓冲
    },
  });
}