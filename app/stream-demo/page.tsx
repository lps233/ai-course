"use client";

import { useState } from "react";

export default function StreamDemo() {
  const [out, setOut] = useState("");

  async function run() {
    const res = await fetch("/api/echo-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "你好，流式世界" }),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
    //   { stream: true } 不能省！中文一个字 3 字节，chunk 可能切在中间
      const chunk = decoder.decode(value, { stream: true });
    //   console.log("chunk:", chunk);
      setOut((prev) => prev + chunk);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <button onClick={run}>开始流式输出</button>
      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{out || "暂无输出"}</pre>
    </main>
  );
}