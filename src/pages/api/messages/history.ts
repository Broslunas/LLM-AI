import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables.");
}

export const prerender = false;

const client = new MongoClient(MONGO_URI);

export async function POST({ request }: { request: Request }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid or empty JSON input." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { userId, message, aiResponse, timestamp } = body;

    if (!userId || !message || !aiResponse || !timestamp) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db("broslunas");
    const messagesCollection = db.collection("messages");

    const result = await messagesCollection.insertOne({
      userId,
      message,
      aiResponse,
      timestamp,
    });

    return new Response(
      JSON.stringify({ success: true, messageId: result.insertedId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving message:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}

export default {
  POST,
};
