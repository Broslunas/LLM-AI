import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken"; // Ensure @types/jsonwebtoken is installed

const MONGO_URI = process.env.MONGO_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

const client = new MongoClient(MONGO_URI);
let db: any;

export async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db(); // Usa la base de datos predeterminada del URI
  }
  return db;
}

export async function verifyUser(token: string) {
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: decoded.id });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
