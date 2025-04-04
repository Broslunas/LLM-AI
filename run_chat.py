from transformers import AutoTokenizer, AutoModelForCausalLM

# Carga el modelo y el tokenizador
tokenizer = AutoTokenizer.from_pretrained("./broslunas_model_llm")
model = AutoModelForCausalLM.from_pretrained("./broslunas_model_llm")

print("💬 Chat iniciado (escribe 'salir' para terminar)\n")

# Bucle de chat
while True:
    user_input = input("Tú: ")
    if user_input.lower() in ["salir", "exit", "quit"]:
        print("👋 ¡Hasta luego!")
        break

    # Codifica el input del usuario
    input_ids = tokenizer.encode(user_input, return_tensors="pt")

    # Genera la respuesta
    output_ids = model.generate(
        input_ids,
        max_length=100,
        do_sample=True,
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id
    )

    # Decodifica la respuesta y la imprime
    response = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print("IA:", response.replace(user_input, "").strip())
