import { useState, useContext, useEffect } from "react";

import axios from "axios";
import AuthContext from "../../context/AuthContext";

const Chatbox = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { token } = useContext(AuthContext);

  const sendMessage = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages([
        ...messages,
        { text: message, isUser: true },
        { text: res.data.response, isUser: false },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.isUser ? "user-message" : "bot-message"}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default Chatbox;
