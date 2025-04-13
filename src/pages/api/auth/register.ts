import { MongoClient } from "mongodb";
import { config } from "dotenv";
import bcrypt from "bcryptjs"; // Use bcryptjs instead of bcrypt
import jwt from "jsonwebtoken";

config(); // Load environment variables

const MONGO_URI_USERS = process.env.MONGO_URI_USERS || "";
const JWT_SECRET = process.env.JWT_SECRET || ""; // Add JWT_SECRET to your .env file
if (!MONGO_URI_USERS || !JWT_SECRET) {
  throw new Error(
    "MONGO_URI_USERS or JWT_SECRET is not defined in the environment variables."
  );
}

const client = new MongoClient(MONGO_URI_USERS);

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ response: "Faltan campos obligatorios." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db("broslunas");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.warn(`User with email ${email} already exists.`);
      return new Response(
        JSON.stringify({
          response:
            "El usuario ya existe. Por favor, use un correo electrónico diferente.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const registrationDate = new Date().toLocaleString("es-ES", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const result = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      registrationDate, // Add registration date
      lastLogin: registrationDate, // Set lastLogin as the registration date
    });

    if (result.acknowledged) {
      // Generate JWT token
      const token = jwt.sign({ username, email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set cookies with user information
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append(
        "Set-Cookie",
        `loggedIn=true; Path=/; Max-Age=3600; ${
          process.env.NODE_ENV === "production" ? "Secure;" : ""
        }`
      );
      headers.append(
        "Set-Cookie",
        `username=${encodeURIComponent(username)}; Path=/; Max-Age=3600; ${
          process.env.NODE_ENV === "production" ? "Secure;" : ""
        }`
      );

      return new Response(
        JSON.stringify({
          response: "Usuario registrado con éxito.",
          token,
          username, // Include username in the response
        }),
        { status: 201, headers }
      );
    }

    return new Response(
      JSON.stringify({ response: "Error al registrar el usuario." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en el registro:", error);
    return new Response(
      JSON.stringify({ response: "Error interno del servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
  }
}

export default {
  POST,
};
