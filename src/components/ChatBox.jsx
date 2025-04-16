import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import updateMessageCounter from "@/components/MessageCounter";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", content: "En que puedo ayudarte hoy" },
  ]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const chatContainerRef = useRef(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const sendMessage = async () => {
    const loggedInCookie = getCookie("loggedIn");
    const usernameCookie = getCookie("username");
    const isLoggedIn = loggedInCookie === "true";

    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }

    if (!query.trim()) return;
    setChatHistory((prev) => [...prev, { sender: "user", content: query }]);
    setQuery("");
    setLoading(true);
    let aiMessage = { sender: "ai", content: "", loading: true };
    setChatHistory((prev) => [...prev, aiMessage]);

    try {
      const formattedHistory = chatHistory
        .filter((message) => message.sender !== "ai" || !message.loading)
        .map((message) => `${message.sender.toUpperCase()}: ${message.content}`)
        .join("\n");

      const fullPrompt = `${formattedHistory}\n-- FIN DE LA CONVERSACIÓN\nUSER: ${query}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        if (chunk) {
          aiMessage.content += chunk;
          aiMessage.loading = false;
          setChatHistory((prev) => [...prev.slice(0, -1), aiMessage]);
        }
      }

      const payload = {
        userId: usernameCookie,
        message: query,
        aiResponse: aiMessage.content,
        timestamp: new Date().toISOString(),
      };

      await fetch("/api/messages/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Update the message counter
      await updateMessageCounter(usernameCookie);
    } catch (error) {
      console.error("Error while contacting the AI:", error);
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        { sender: "ai", content: "Error al contactar con la IA." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-box">
      <div ref={chatContainerRef} className="chat-history">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === "user" ? "user" : "ai"}`}
          >
            <span className="message-content">
              {message.sender === "ai" && message.loading ? (
                <span className="spinner"></span>
              ) : null}
              {message.sender === "ai" ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                message.content
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          placeholder="Escribe tu mensaje..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={loading}>
          ➤
        </button>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Debes iniciar sesión para enviar mensajes.</p>
            <button onClick={() => (window.location.href = "/login")}>
              Iniciar Sesión
            </button>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
