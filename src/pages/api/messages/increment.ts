import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

const MONGO_URI_USERS = process.env.MONGO_URI_USERS || "";
if (!MONGO_URI_USERS) {
  throw new Error(
    "MONGO_URI_USERS is not defined in the environment variables."
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
      return new Response(
        JSON.stringify({ response: "Invalid or empty JSON input." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { username } = body;

    if (!username) {
      return new Response(
        JSON.stringify({ response: "Username is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db("broslunas");
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { username },
      { $inc: { messageCount: 1 } },
      { upsert: true }
    );

    return new Response(
      JSON.stringify({
        response: "Message count updated successfully.",
        result,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating message count:", error);
    return new Response(
      JSON.stringify({ response: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
  }
}

export default {
  POST,
};
