import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatBox() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", content: "Hola brother, en que puedo ayudarte" },
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
    console.log("Checking login status...");
    console.log("Current cookies:", document.cookie);

    const loggedInCookie = getCookie("loggedIn");
    console.log("Value of loggedIn cookie:", loggedInCookie);

    const isLoggedIn = loggedInCookie === "true";
    console.log("Parsed isLoggedIn:", isLoggedIn);

    if (!isLoggedIn) {
      console.log("User is not logged in. Showing modal.");
      setShowModal(true); // Show modal if not logged in
      return;
    }

    console.log("User is logged in. Proceeding to send message.");

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

      console.log("Sending message to API with prompt:", fullPrompt);

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
            width: 60%;
            height: 400px;
            margin: 20px auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            font-family: 'Roboto', sans-serif; /* Changed font family */
          }
          .chat-history {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background-color: #2a2a2a;
            border-radius: 5px;
            border: 1px solid #444;
            font-size: 1.2rem; /* Increased font size */
          }
          .message {
            margin: 5px 0;
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
            font-size: 1.2rem; /* Increased font size */
          }
          .message.user .message-content {
            background-color: #e67e22;
            color: #fff;
          }
          .message.ai .message-content {
            background-color: #444;
            color: #fff;
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
            flex: 1;
            height: 35px;
            background-color: #444;
            color: #f0f0f0;
            border: 1px solid #555;
            border-radius: 5px;
            padding: 10px;
            resize: none;
            font-size: 1.4rem; /* Increased font size */
            font-family: 'Roboto', sans-serif; /* Changed font family */
          }
          .chat-input button {
            background-color: #e67e22;
            color: #fff;
            border: none;
            padding: 10px;
            border-radius: 50%;
            cursor: pointer;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem; /* Increased font size */
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
          @media (max-width: 768px) {
            .chat-box {
              width: 90%;
              height: 300px;
            }
          }
          @media (max-width: 480px) {
            .chat-box {
              height: 250px;
            }
            .chat-input textarea {
              height: 30px;
            }
            .chat-input button {
              width: 30px;
              height: 30px;
            }
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: #000;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          .modal-content button {
            margin: 10px;
            padding: 10px 20px;
            background-color: #e67e22;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .modal-content button:hover {
            background-color: #d35400;
          }
        `}
      </style>
    </div>
  );
}
