from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware 
from db import get_db_connection

# 1. INICIALIZAMOS LA APP 
app = FastAPI(title="Gym Tracker API", version="1.0")

# 2. CONFIGURAMOS EL CORS (El Guardaespaldas)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================================
# RUTAS DE LECTURA (GET) - Para pedir el menú
# ==========================================================

@app.get("/")
def read_root():
    return {"mensaje": "¡El mesero de FastAPI está listo para tomar tu orden!"}

@app.get("/rutinas")
def obtener_rutinas():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Error conectando a la base de datos")
    try:
        cursor = conn.cursor()
        consulta_sql = "SELECT routine_id, name FROM routines WHERE user_id = 1 ORDER BY routine_id ASC;"
        cursor.execute(consulta_sql)
        rutinas = cursor.fetchall()
        return rutinas
    except Exception as e:
        print(f"Error en la consulta: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.get("/ejercicios")
def obtener_ejercicios():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Error conectando a la base de datos")
    try:
        cursor = conn.cursor()
        consulta_sql = "SELECT exercise_id, name, muscle_group FROM exercises ORDER BY name ASC;"
        cursor.execute(consulta_sql)
        ejercicios = cursor.fetchall()
        return ejercicios
    except Exception as e:
        print(f"Error en la consulta: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.get("/rutinas/{routine_id}/ejercicios")
def obtener_ejercicios_de_rutina(routine_id: int):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Error conectando a la base de datos")
    try:
        cursor = conn.cursor()
        consulta_sql = """
            SELECT e.exercise_id, e.name, e.muscle_group, re.order_index 
            FROM exercises e
            JOIN routine_exercises re ON e.exercise_id = re.exercise_id
            WHERE re.routine_id = %s
            ORDER BY re.order_index ASC;
        """
        cursor.execute(consulta_sql, (routine_id,))
        ejercicios_rutina = cursor.fetchall()
        return ejercicios_rutina
    except Exception as e:
        print(f"Error en la consulta: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================================
# RUTAS DEL DASHBOARD (HOME)
# ==========================================================
@app.get("/resumen")
def obtener_resumen():
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        
        # 1. Buscar el último peso registrado
        cursor.execute("SELECT weight_kg FROM body_weight_log WHERE user_id = 1 ORDER BY logged_at DESC LIMIT 1;")
        res_peso = cursor.fetchone()
        peso_actual = res_peso[0] if res_peso else 0.0
        
        # 2. Buscar la fecha de tu último entrenamiento
        cursor.execute("SELECT start_time FROM workouts WHERE user_id = 1 ORDER BY start_time DESC LIMIT 1;")
        res_fecha = cursor.fetchone()
        if res_fecha and res_fecha[0]:
            # Formateamos la fecha para que se vea bonita (ej. 24/03/2026)
            fecha_str = res_fecha[0].strftime("%d/%m/%Y")
        else:
            fecha_str = "Sin registros"

        # 3. Contar cuántos entrenamientos llevas en total
        cursor.execute("SELECT COUNT(*) FROM workouts WHERE user_id = 1;")
        res_total = cursor.fetchone()
        total_entrenos = res_total[0] if res_total else 0

        return {
            "peso_actual": float(peso_actual),
            "ultimo_entreno": fecha_str,
            "total_entrenos": total_entrenos
        }
    except Exception as e:
        print(f"Error resumen: {e}")
        raise HTTPException(status_code=500, detail="Error interno")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# Modelo para recibir el peso
class NuevoPeso(BaseModel):
    peso: float

@app.post("/peso")
def guardar_peso(datos: NuevoPeso):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO body_weight_log (user_id, weight_kg, logged_at) 
            VALUES (1, %s, CURRENT_TIMESTAMP);
        """, (datos.peso,))
        conn.commit()
        return {"mensaje": "Peso actualizado"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================================
# MODELOS DE DATOS 
# ==========================================================
class SetLog(BaseModel):
    exercise_name: str  
    weight: float
    reps: int
    unit: str

class WorkoutLog(BaseModel):
    routine_id: Optional[int] = None
    duration_minutes: int
    sets: List[SetLog]


# ==========================================================
# RUTA DE MARCA A VENCER (PR - Personal Record)
# ==========================================================
@app.get("/marca")
def obtener_marca(ejercicio: str):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Error conectando a la base de datos")

    try:
        cursor = conn.cursor()
        
        # Buscamos el Récord Personal (El peso estandarizado más alto de este ejercicio)
        consulta = """
            SELECT ws.input_weight, ws.reps, ws.weight_unit
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.exercise_id
            WHERE e.name = %s
            ORDER BY ws.standardized_weight_kg DESC, ws.reps DESC
            LIMIT 1;
        """
        cursor.execute(consulta, (ejercicio,))
        resultado = cursor.fetchone()
        
        if resultado:
            # Función segura por si db.py devuelve tupla o diccionario
            def extract(row, key, idx):
                try: return row[key]
                except (TypeError, KeyError): return row[idx]
                
            return {
                "weight": extract(resultado, 'input_weight', 0),
                "reps": extract(resultado, 'reps', 1),
                "unit": extract(resultado, 'weight_unit', 2)
            }
        else:
            return None # Retorna null a React si nunca has hecho el ejercicio

    except Exception as e:
        print(f"Error obteniendo marca: {e}")
        raise HTTPException(status_code=500, detail="Error interno")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================================
# RUTA DE ESCRITURA (POST) - Guardar el entrenamiento
# ==========================================================
@app.post("/entrenamientos")
def guardar_entrenamiento(workout: WorkoutLog):
    
    # 🔥 Función ayudante a prueba de balas para extraer IDs de PostgreSQL
    def extract_id(row, key_name):
        try:
            return row[key_name]
        except (TypeError, KeyError):
            return row[0]

    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Error conectando a la base de datos")

    try:
        cursor = conn.cursor()
        
        # 1. CREAMOS EL "TICKET" DEL ENTRENAMIENTO
        intervalo_tiempo = f"{workout.duration_minutes} minutes"
        
        cursor.execute("""
            INSERT INTO workouts (user_id, routine_id, start_time, end_time)
            VALUES (1, %s, CURRENT_TIMESTAMP - %s::interval, CURRENT_TIMESTAMP) 
            RETURNING workout_id;
        """, (workout.routine_id, intervalo_tiempo))
        
        # Usamos nuestra nueva función a prueba de balas
        res_workout = cursor.fetchone()
        nuevo_workout_id = extract_id(res_workout, 'workout_id')

        # 2. GUARDAMOS CADA SERIE 
        for index, s in enumerate(workout.sets):
            
            cursor.execute("SELECT exercise_id FROM exercises WHERE name = %s", (s.exercise_name,))
            ej_resultado = cursor.fetchone()
            
            if ej_resultado:
                real_exercise_id = extract_id(ej_resultado, 'exercise_id')
            else:
                cursor.execute("""
                    INSERT INTO exercises (name, muscle_group) 
                    VALUES (%s, 'Otro') RETURNING exercise_id;
                """, (s.exercise_name,))
                res_ej = cursor.fetchone()
                real_exercise_id = extract_id(res_ej, 'exercise_id')

            # Normalizamos el peso
            peso_estandar = s.weight * 0.453592 if s.unit == 'lbs' else s.weight
            
            # Insertamos el set
            cursor.execute("""
                INSERT INTO workout_sets (
                    workout_id, exercise_id, set_number, reps, 
                    input_weight, weight_unit, standardized_weight_kg
                ) VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (
                nuevo_workout_id, 
                real_exercise_id, 
                index + 1,  
                s.reps, 
                s.weight, 
                s.unit, 
                peso_estandar
            ))

        # 3. EL SELLO DE ORO
        conn.commit()
        return {"mensaje": "¡Entrenamiento guardado con éxito! 🏆", "workout_id": nuevo_workout_id}

    except Exception as e:
        conn.rollback() 
        print(f"Error guardando el entreno: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        if cursor: cursor.close()
        if conn: conn.close()