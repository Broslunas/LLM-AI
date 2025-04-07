import { MongoClient } from "mongodb";
import { config } from "dotenv";
import bcrypt from "bcryptjs"; // Use bcryptjs for password comparison
import jwt from "jsonwebtoken";

config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || ""; // Ensure JWT_SECRET is defined in .env
if (!MONGO_URI || !JWT_SECRET) {
  throw new Error(
    "MONGO_URI or JWT_SECRET is not defined in the environment variables."
  );
}

const client = new MongoClient(MONGO_URI);

export async function POST({ request }: { request: Request }) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ response: "Faltan campos obligatorios." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db("broslunas");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });
    if (!user) {
      return new Response(
        JSON.stringify({ response: "Usuario o contraseña incorrectos." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ response: "Usuario o contraseña incorrectos." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Set cookie with login information
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append(
      "Set-Cookie",
      `loggedIn=true; HttpOnly; Path=/; Max-Age=3600`
    );
    headers.append(
      "Set-Cookie",
      `username=${encodeURIComponent(user.username)}; Path=/; Max-Age=3600`
    );

    return new Response(
      JSON.stringify({
        response: "Inicio de sesión exitoso.",
        token,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
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
