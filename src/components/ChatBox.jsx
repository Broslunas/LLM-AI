import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import updateMessageCounter from "@/components/MessageCounter";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", content: "Hola Minecrafter, que te cuentas" },
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
      <style>
        {`
          .chat-box {
            background-color: #3a3a3a;
            padding: 15px;
            border-radius: 8px;
            width: 70%;
            height: 60vh; /* Adjust height dynamically */
            margin: 5px auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            ;
          }
          .chat-history {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background-color: #2a2a2a;
            border-radius: 5px;
            border: 1px solid #444;
            font-size: 1.2rem;
          }
          .chat-history::-webkit-scrollbar {
            width: 8px;
          }
          .chat-history::-webkit-scrollbar-thumb {
            background-color: #e67e22;
            border-radius: 4px;
          }
          .chat-history::-webkit-scrollbar-thumb:hover {
            background-color: #d35400;
          }
          .message {
            margin: 5px 0;
            animation: fadeInMessage 0.5s ease-in-out forwards;
          }
          .message.user {
            text-align: right;
          }
          .message.ai {
            text-align: left;
          }
          .message-content {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 1.2rem;
            min-height: 35px;
          }
          .message.user .message-content {
            font-family: "Minecraft", sans-serif; /* Aplicar la fuente a los mensajes del usuario */
            background-color: #e67e22;
            color: #fff;
            animation: bounceMessage 0.3s ease-in-out forwards;
          }
          .message.ai .message-content {
            font-family: "Minecraft", sans-serif; /* Aplicar la fuente a los mensajes del chatbot */
            background-color: #444;
            color: #fff;
            animation: pulseMessage 1.5s infinite ease-in-out;
          }
          @keyframes fadeInMessage {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes bounceMessage {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          @keyframes pulseMessage {
            0% {
              opacity: 0.8;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.8;
            }
          }
          .spinner {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 2px solid #e67e22;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 5px;
          }
          .chat-input {
            display: flex;
            gap: 10px;
            align-items: center;
            padding: 10px;
            background-color: #2a2a2a;
            border-top: 1px solid #444;
          }
          .chat-input textarea {
            font-family: "Minecraft", sans-serif; /* Aplicar la fuente al textarea */
            flex: 1;
            height: 35px;
            background-color: #444;
            color: #f0f0f0;
            border: 1px solid #555;
            border-radius: 5px;
            padding: 10px;
            resize: none;
            font-size: 1.4rem;
          }
          .chat-input button {
            background-color: #e67e22;
            color: #fff;
            border: none;
            padding: 10px;
            border-radius: 35%;
            cursor: pointer;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
          }
          .chat-input button:disabled {
            background-color: #777;
            cursor: not-allowed;
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @media (max-width: 1024px) {
            .chat-box {
              width: 80%;
              height: 60vh; /* Adjust height for medium screens */
            }
          }
          @media (max-width: 768px) {
            .chat-box {
              width: 90%;
              height: 70vh; /* Adjust height for smaller screens */
            }
          }
          @media (max-width: 480px) {
            .chat-box {
              width: 100%;
              height: 80vh; /* Adjust height for very small screens */
              padding: 10px;
            }
            .chat-input textarea {
              font-size: 1.2rem; /* Adjust font size for smaller screens */
            }
            .chat-input button {
              width: 30px;
              height: 30px;
              font-size: 1rem;
            }
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-in-out;
          }
          .modal-content {
            background: #1e1e1e;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            animation: slideDown 0.3s ease-in-out;
          }
          .modal-content p {
            color: #f0f0f0;
            font-size: 1.2rem;
            margin-bottom: 20px;
          }
          .modal-content button {
            margin: 10px;
            padding: 12px 25px;
            background-color: #e67e22;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;: 2px solid #e67e22;
            ;
            transition: background-color 0.3s ease;
          }
          .modal-content button:hover {
            background-color: #d35400;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
