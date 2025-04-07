export const prerender = false;

export async function POST({ request }) {
  try {
    const { query } = await request.json();

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.5,
        max_tokens: 100,
      }),
    });

    const data = await res.json();

    const message = data.choices?.[0]?.message?.content ?? "Sin respuesta.";
    return new Response(JSON.stringify({ response: message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en la llamada a DeepSeek:", error);
    return new Response(
      JSON.stringify({ response: "Error al procesar la solicitud." }),
      {
        status: 500,
      }
    );
  }
}
