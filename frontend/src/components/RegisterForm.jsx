// src/components/RegisterForm.jsx
import React, { useState } from "react";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Registro exitoso");

        // Realizar login automáticamente tras el registro
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          // Guardar token y userId en cookies (1 hora de expiración)
          document.cookie = `token=${loginData.token}; path=/; max-age=3600`;
          document.cookie = `userId=${loginData.userId}; path=/; max-age=3600`;
          // Redirigir al inicio
          window.location.href = "/";
        } else {
          alert(loginData.message || "Error en el login automático");
        }
      } else {
        alert(data.message || "Error en el registro");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      alert("Error en la conexión");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registro</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
      <button type="submit">Registrar</button>
    </form>
  );
}
