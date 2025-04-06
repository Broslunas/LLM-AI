// src/components/LoginForm.jsx
import React, { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Guardar token y userId en cookies (1 hora de expiración)
        document.cookie = `token=${data.token}; path=/; max-age=3600`;
        document.cookie = `userId=${data.userId}; path=/; max-age=3600`;
        // Redirigir al inicio
        window.location.href = "/";
      } else {
        alert(data.message || "Error en el login");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error en la conexión");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
