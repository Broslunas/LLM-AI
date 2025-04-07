import { useState } from "react";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error al contactar con la IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Chat con DeepSeek</h1>
      <textarea
        placeholder="Escribe tu mensaje..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
      {response && <p>{response}</p>}
    </div>
  );
}
