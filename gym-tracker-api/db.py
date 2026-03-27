import psycopg2
from psycopg2.extras import RealDictCursor

# 1. Las credenciales de tu cocina (PostgreSQL)
DB_HOST = "localhost"
DB_NAME = "gym_tracker_db"
DB_USER = "postgres" # Por lo general, este es el usuario por defecto en pgAdmin
DB_PASS = "AdM1df6nr24$$" # ⚠️ Cámbiala por tu contraseña real

def get_db_connection():
    """
    Esta función es la llave de la cocina. 
    Se ejecuta cada vez que el mesero (FastAPI) necesita sacar o guardar un dato.
    """
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            cursor_factory=RealDictCursor # 🔥 El truco para que los datos salgan en formato JSON
        )
        return conn
    except Exception as e:
        print("❌ Error fatal conectando a la base de datos:", e)
        return None