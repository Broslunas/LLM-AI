# Chat con IA sobre Minecraft

¡Bienvenido al proyecto de **Chat con IA sobre Minecraft**! Este proyecto utiliza **Astro** para crear una experiencia interactiva y única, con fuentes inspiradas en Minecraft, para los fanáticos del juego.

## Características

- Chat impulsado por inteligencia artificial.
- Interfaz con diseño inspirado en Minecraft.
- Construido con **Astro**, un framework moderno para sitios web rápidos y dinámicos.

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/broslunas/chat-ai.git
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura los archivos `.env` necesarios. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   MONGO_URI=""
   JWT_SECRET=""
   DEEPSEEK_API_KEY=""
   ```

   - **MONGO_URI**: Crea una base de datos en MongoDB y utiliza la URI de conexión proporcionada.
   - **JWT_SECRET**: Genera un secreto JWT en [jwtsecret.com](https://jwtsecret.com/generate).
   - **DEEPSEEK_API_KEY**: Obtén tu clave API en [DeepSeek Platform](https://platform.deepseek.com/api_keys).

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Cómo colaborar

¡Nos encantaría que contribuyas a este proyecto! Sigue estos pasos para colaborar:

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad o corrección de errores:
   ```bash
   git checkout -b mi-nueva-funcionalidad
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Añadida nueva funcionalidad"
   ```
4. Sube tus cambios a tu fork:
   ```bash
   git push origin mi-nueva-funcionalidad
   ```
5. Abre un pull request en este repositorio.

¡Gracias por ser parte de este proyecto!
