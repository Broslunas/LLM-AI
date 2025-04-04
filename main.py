import os
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer

def main():
    # Define el nombre del modelo preentrenado (puedes cambiarlo según lo necesites)
    model_name = "gpt2"
    
    # Carga el tokenizador y el modelo desde Hugging Face
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    # Asigna el eos_token como token de padding
    tokenizer.pad_token = tokenizer.eos_token
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # Carga el dataset desde un archivo JSON.
    # Asegúrate de tener un archivo "example_dataset.json" en el mismo directorio con el siguiente contenido:
    # [
    #   { "text": "Hola, este es un ejemplo de dataset para fine-tuning." },
    #   { "text": "Este modelo aprenderá a generar texto a partir de datos personalizados." }
    # ]
    dataset = load_dataset("json", data_files={"train": "./json/minecraft_data.json"})
    
    # Función para tokenizar cada entrada del dataset y añadir los labels
    def tokenize_function(examples):
        output = tokenizer(
            examples["text"],
            truncation=True,
            padding="max_length",
            max_length=128
        )
        # Asignamos los labels para que el modelo pueda calcular la pérdida
        output["labels"] = output["input_ids"].copy()
        return output
    
    # Aplica la tokenización al dataset de entrenamiento
    tokenized_dataset = dataset["train"].map(tokenize_function, batched=True)
    
    # Define los argumentos de entrenamiento
    training_args = TrainingArguments(
        output_dir="./v1",             # Directorio donde se guardarán los resultados
        num_train_epochs=3,                 # Número de épocas de entrenamiento
        per_device_train_batch_size=4,      # Tamaño de batch para entrenamiento
        per_device_eval_batch_size=4,       # Tamaño de batch para evaluación
        learning_rate=5e-5,                 # Tasa de aprendizaje
        eval_strategy="steps",        # Evalúa cada ciertos pasos (nota: warning por usar eval_strategy)
        save_steps=500,                     # Guarda el modelo cada 500 pasos
        eval_steps=500,                     # Evalúa cada 500 pasos
        logging_steps=100,                  # Registra cada 100 pasos
        weight_decay=0.01,                  # Decaimiento del peso para regularización
    )
    
    # Crea el objeto Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        eval_dataset=tokenized_dataset  # Si tienes un dataset de validación separado, cámbialo aquí
    )
    
    # Inicia el entrenamiento
    trainer.train()
    
    # Evalúa el modelo después del entrenamiento
    eval_results = trainer.evaluate()
    print("Resultados de la evaluación:", eval_results)
    
    # Guarda el modelo y el tokenizador entrenados
    model.save_pretrained("./broslunas_model_llm-v1")
    tokenizer.save_pretrained("./broslunas_model_llm-v1")

if __name__ == "__main__":
    main()
