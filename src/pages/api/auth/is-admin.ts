import { MongoClient } from "mongodb";
import { config } from "dotenv";

export const prerender = false;

config();

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  throw new Error("MONGO_URI no se ha definido en las variables de entorno.");
}

const client = new MongoClient(MONGO_URI);

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return new Response(
        JSON.stringify({ isAdmin: false, message: "Username is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db("broslunas");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });

    if (user && user.isAdmin) {
      return new Response(JSON.stringify({ isAdmin: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ isAdmin: false }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return new Response(
      JSON.stringify({ isAdmin: false, message: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
  }
}

export default {
  POST,
};
