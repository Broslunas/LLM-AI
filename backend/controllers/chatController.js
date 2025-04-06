const axios = require("axios");

const deepseekChat = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions", // Revisa la URL exacta de la API de Deepseek
      {
        model: "deepseek-chat", // Ajusta según la documentación de Deepseek
        messages: [{ role: "user", content: prompt }],
        temperature: 1,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error en Deepseek API:",
      error.response?.data || error.message
    );
    throw new Error("Error al procesar la solicitud");
  }
};

module.exports = { deepseekChat };
