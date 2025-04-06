const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const chatRoutes = require("./routes/chatRoutes");
require("dotenv").config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // Reemplaza con tu URL de frontend
    credentials: true, // Permite enviar cookies/tokens
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error(err));

const authRoutes = require("./routes/authRoutes");

// Usar rutas
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Ruta protegida de ejemplo
app.get(
  "/api/protected",
  require("./middleware/authMiddleware"),
  (req, res) => {
    res.json({ message: "Ruta protegida accesible" });
  }
);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
