import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables.");
}

const client = new MongoClient(MONGO_URI);

export const prerender = false;

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

    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: userId." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db("broslunas");
    const userCollectionName = `historial-${userId}`;
    const userMessagesCollection = db.collection(userCollectionName);

    const messages = await userMessagesCollection
      .find({})
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .toArray();

    return new Response(JSON.stringify({ success: true, messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
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
