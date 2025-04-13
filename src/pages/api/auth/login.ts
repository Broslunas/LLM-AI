import { MongoClient } from "mongodb";
import { config } from "dotenv";
import bcrypt from "bcryptjs"; // Use bcryptjs for password comparison
import jwt from "jsonwebtoken";

config(); // Load environment variables

const MONGO_URI_USERS = process.env.MONGO_URI_USERS || "";
const JWT_SECRET = process.env.JWT_SECRET || ""; // Ensure JWT_SECRET is defined in .env
if (!MONGO_URI_USERS || !JWT_SECRET) {
  throw new Error(
    "MONGO_URI_USERS or JWT_SECRET is not defined in the environment variables."
  );
}

if (MONGO_URI_USERS.includes(",")) {
  throw new Error(
    "MONGO_URI_USERS contains multiple service names, which is not allowed. Please ensure your MongoDB connection string is correctly configured in the .env file."
  );
}

const client = new MongoClient(MONGO_URI_USERS);

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ response: "Invalid JSON input." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ response: "Faltan campos obligatorios." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      await client.connect();
    } catch (mongoError) {
      const error = mongoError as any; // Explicitly assert the type as 'any'
      console.error("MongoDB connection error:", {
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        uri: MONGO_URI_USERS.replace(/:\/\/.*@/, "://<credentials-hidden>@"), // Log sanitized URI
      });

      if (error.codeName === "AtlasError") {
        return new Response(
          JSON.stringify({
            response:
              "Database authentication failed. Please verify your MongoDB URI, username, and password in the .env file. Ensure the user has the correct permissions and the IP address is whitelisted in MongoDB Atlas.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          response:
            "Failed to connect to the database. Please try again later.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = client.db("broslunas");
    const usersCollection = db.collection("users");

    // Find the user (case-insensitive match for username)
    const user = await usersCollection.findOne({
      username: { $regex: `^${username}$`, $options: "i" },
    });
    if (!user || !user.password) {
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
      `loggedIn=true; Path=/; Max-Age=3600; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );
    headers.append(
      "Set-Cookie",
      `username=${encodeURIComponent(user.username)}; Path=/; Max-Age=3600; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    const lastLogin = new Date().toLocaleString("es-ES", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await usersCollection.updateOne(
      { username: { $regex: `^${username}$`, $options: "i" } },
      { $set: { lastLogin } } // Update last login time
    );

    return new Response(
      JSON.stringify({
        response: "Inicio de sesión exitoso.",
        token,
        username: user.username, // Include username in the response
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
