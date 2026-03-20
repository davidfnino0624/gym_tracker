from fastapi import FastAPI

# 1. Creamos la aplicación (Inauguramos el restaurante)
app = FastAPI(title="Gym Tracker API", version="1.0")

# 2. Definimos nuestra primera ruta (La puerta de entrada)
@app.get("/")
def read_root():
    return {
        "estado": "Exitoso",
        "mensaje": "¡Tu b corriendo a la perfackend de FastAPI estáección!"
    }