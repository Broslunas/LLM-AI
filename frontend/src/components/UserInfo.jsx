// src/components/UserInfo.jsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function UserInfo() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Leer las cookies usando js-cookie
    const storedToken = Cookies.get("token");
    const storedUserId = Cookies.get("userId");

    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  return (
    <div>
      <h2>Información del Usuario desde Cookies</h2>
      {token ? (
        <>
          <p>
            <strong>Token:</strong> {token}
          </p>
          <p>
            <strong>User ID:</strong> {userId}
          </p>
        </>
      ) : (
        <p>No se encontraron cookies de autenticación.</p>
      )}
    </div>
  );
}
