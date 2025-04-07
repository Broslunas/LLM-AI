import { verifyUser } from "../lib/auth";

export async function requireAuth(context: any, next: Function) {
  const token = context.request.headers
    .get("Authorization")
    ?.replace("Bearer ", "");
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const user = await verifyUser(token);
    context.locals.user = user; // Agrega el usuario al contexto
    return next();
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
}
