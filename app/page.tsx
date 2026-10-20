"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, Suspense } from "react";

/* ============ Day01：最简聊天 ============ */
function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  return (
    <div>
      {messages.map((m) => (
        <p key={m.id}>
          <b>{m.role}:</b>{" "}
          {m.parts
            .filter((p) => p.type === "text")
            .map((p, i) => (
              <span key={i}>{p.text}</span>
            ))}
        </p>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
    </div>
  );
}

/* ============ Day02：数 token ============ */
type Row = Record<string, string | number>;

function TokenLab() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function call(url: string, body?: unknown) {
    setBusy(true);
    setErr("");
    setRows(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setRows(data.results ?? [data]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 32,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h3>Day02 · Token 实验室</h3>

      <button disabled={busy} onClick={() => call("/api/usage", { prompt: "今天天气真好，我想去公园散步" })}>
        ① 单句数 token
      </button>{" "}
      <button disabled={busy} onClick={() => call("/api/usage/compare")}>
        ② 中英对比
      </button>

      {busy && <p>请求中…（推理模型要想一会儿）</p>}
      {err && <p style={{ color: "crimson" }}>出错：{err}</p>}

      {rows && (
        <table style={{ marginTop: 12, borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {Object.entries(row).map(([k, v]) => (
                  <td key={k} style={{ border: "1px solid #eee", padding: "4px 8px" }}>
                    <b>{k}</b>: {typeof v === "string" && v.length > 40 ? v.slice(0, 40) + "…" : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>Day01 · 聊天</h2>
      <Suspense fallback={<p>loading...</p>}>
        <Chat />
      </Suspense>

      {/* Day02 面板本身不产生随机 id，但统一包一层更省心 */}
      <Suspense fallback={<p>loading...</p>}>
        <TokenLab />
      </Suspense>
    </main>
  );
}
