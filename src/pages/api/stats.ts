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
    const body = await request.json();
    const { username } = body;

    await client.connect();
    const db = client.db("broslunas");
    const usersCollection = db.collection("users");

    const totalUsers = await usersCollection.countDocuments();
    const totalMessages = await usersCollection
      .aggregate([{ $group: { _id: null, total: { $sum: "$messageCount" } } }])
      .toArray();

    const topUsers = await usersCollection
      .find({}, { projection: { username: 1, messageCount: 1 } })
      .sort({ messageCount: -1 })
      .limit(5)
      .toArray();

    let userStats = {
      username: "Desconocido",
      email: "Desconocido",
      userMessages: 0,
    };
    if (username) {
      const user = await usersCollection.findOne({ username });
      if (user) {
        userStats = {
          username: user.username,
          email: user.email,
          userMessages: user.messageCount || 0,
        };
      }
    }

    return new Response(
      JSON.stringify({
        ...userStats,
        totalUsers,
        totalMessages: totalMessages[0]?.total || 0,
        topUsers: topUsers.map((user) => ({
          username: user.username,
          messageCount: user.messageCount || 0,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return new Response(JSON.stringify({ response: "Error fetching stats." }), {
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
