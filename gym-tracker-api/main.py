from pydantic import BaseModel, Field 
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware 
from db import get_db_connection
import jwt
import bcrypt 
from datetime import datetime, timedelta

# ==========================================================
# 1. INICIALIZACIÓN DE LA APLICACIÓN
# ==========================================================
app = FastAPI(title="Gym Tracker API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================================
# 3. 🛡️ SISTEMA DE SEGURIDAD (BCRYPT NATIVO Y TOKENS)
# ==========================================================
SECRET_KEY = "clave_secreta_gym_super_dificil" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 

# 🔥 ESTO ES NUEVO: Le dice a FastAPI dónde se consiguen los tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 🔥 EL GUARDAESPALDAS: Lee el token y saca el ID real del usuario
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="La sesión ha expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="No tienes permisos (Token inválido)")

class UserRegister(BaseModel):
    username: str
    email: str
    password: str = Field(..., max_length=72)

class UserLogin(BaseModel):
    email: str
    password: str

def extract_id(row, key_name, index=0):
    try:
        if isinstance(row, dict): return row[key_name]
        return row[index]
    except (TypeError, KeyError, IndexError):
        return None

# ==========================================================
# 5. RUTAS DE AUTENTICACIÓN
# ==========================================================

@app.post("/registro")
def registrar_usuario(user: UserRegister):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Este correo ya está registrado.")

        hashed_pwd = get_password_hash(user.password)
        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING user_id;", (user.username, user.email, hashed_pwd))
        
        nuevo_user_id = extract_id(cursor.fetchone(), 'user_id', 0)
        conn.commit()
        return {"mensaje": "¡Atleta registrado exitosamente!", "user_id": nuevo_user_id}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.post("/login")
def iniciar_sesion(user: UserLogin):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, password_hash, username FROM users WHERE email = %s", (user.email,))
        db_user = cursor.fetchone()

        if not db_user: raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

        user_id = extract_id(db_user, 'user_id', 0)
        hashed_pwd = extract_id(db_user, 'password_hash', 1)
        username = extract_id(db_user, 'username', 2)

        if not verify_password(user.password, hashed_pwd):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

        token = create_access_token(data={"sub": str(user_id), "username": username})
        return {"access_token": token, "token_type": "bearer", "username": username}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================================
# 6. RUTAS DEL DASHBOARD (AHORA SÍ SON PRIVADAS 🔥)
# ==========================================================

@app.get("/resumen")
# 🔥 Pedimos el Depends(get_current_user) para saber quién está pidiendo esto
def obtener_resumen(usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        # 🔥 Reemplazamos el "1" por la variable del usuario real
        cursor.execute("SELECT weight_kg FROM body_weight_log WHERE user_id = %s ORDER BY logged_at DESC LIMIT 1;", (usuario_actual_id,))
        res_p = cursor.fetchone()
        peso = extract_id(res_p, 'weight_kg', 0) or 0.0
        
        cursor.execute("SELECT start_time FROM workouts WHERE user_id = %s ORDER BY start_time DESC LIMIT 1;", (usuario_actual_id,))
        res_f = cursor.fetchone()
        fecha = extract_id(res_f, 'start_time', 0).strftime("%d/%m/%Y") if res_f else "Sin datos"

        cursor.execute("SELECT COUNT(*) FROM workouts WHERE user_id = %s;", (usuario_actual_id,))
        total = extract_id(cursor.fetchone(), 'count', 0)

        return {"peso_actual": float(peso), "ultimo_entreno": fecha, "total_entrenos": total}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

class NuevoPeso(BaseModel):
    peso: float

@app.post("/peso")
def guardar_peso(datos: NuevoPeso, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO body_weight_log (user_id, weight_kg, logged_at) VALUES (%s, %s, CURRENT_TIMESTAMP);", (usuario_actual_id, datos.peso))
        conn.commit()
        return {"mensaje": "Peso corporal guardado con éxito"}
    finally:
        if conn: conn.close()

@app.get("/rutinas")
def obtener_rutinas(usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT routine_id, name FROM routines WHERE user_id = %s ORDER BY routine_id ASC;", (usuario_actual_id,))
        return cursor.fetchall()
    finally:
        if conn: conn.close()

# ==========================================================
# RUTA PARA CREAR NUEVAS RUTINAS
# ==========================================================
class NuevaRutina(BaseModel):
    name: str

@app.post("/rutinas")
def crear_rutina(rutina: NuevaRutina, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO routines (user_id, name) 
            VALUES (%s, %s) RETURNING routine_id;
        """, (usuario_actual_id, rutina.name))
        
        nuevo_id = extract_id(cursor.fetchone(), 'routine_id', 0)
        conn.commit()
        return {"mensaje": "Rutina creada con éxito", "routine_id": nuevo_id, "name": rutina.name}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ==========================================================
# RUTA PARA AGREGAR EJERCICIOS A UNA RUTINA (Constructor)
# ==========================================================
class AgregarEjercicioRutina(BaseModel):
    exercise_id: int

@app.post("/rutinas/{routine_id}/ejercicios")
def agregar_ejercicio_a_rutina(routine_id: int, datos: AgregarEjercicioRutina, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        
        # 1. Verificamos que la rutina sea de este usuario por seguridad
        cursor.execute("SELECT routine_id FROM routines WHERE routine_id = %s AND user_id = %s", (routine_id, usuario_actual_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta rutina")

        # 2. Calculamos en qué posición va (Le ponemos un ALIAS 'next_order' para que el diccionario no explote)
        cursor.execute("SELECT COALESCE(MAX(order_index), 0) + 1 AS next_order FROM routine_exercises WHERE routine_id = %s", (routine_id,))
        res_orden = cursor.fetchone()
        
        # Usamos nuestra herramienta antibalas para sacar el número
        siguiente_orden = extract_id(res_orden, 'next_order', 0)

        # 3. Insertamos el vínculo en la base de datos
        cursor.execute("""
            INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets)
            VALUES (%s, %s, %s, 3)
        """, (routine_id, datos.exercise_id, siguiente_orden))
        
        conn.commit()
        return {"mensaje": "Ejercicio agregado a la rutina con éxito"}
    except Exception as e:
        if conn: conn.rollback()
        print(f"Error agregando ejercicio: {e}") # Así vemos en la terminal negra si pasa algo más
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================================
# RUTA PARA ELIMINAR UN EJERCICIO DE LA RUTINA
# ==========================================================
@app.delete("/rutinas/{routine_id}/ejercicios/{exercise_id}")
def eliminar_ejercicio_de_rutina(routine_id: int, exercise_id: int, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        
        # 1. El Guardaespaldas revisa que la rutina sí sea tuya
        cursor.execute("SELECT routine_id FROM routines WHERE routine_id = %s AND user_id = %s", (routine_id, usuario_actual_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta rutina")

        # 2. Borramos el ejercicio de esa rutina específica
        cursor.execute("DELETE FROM routine_exercises WHERE routine_id = %s AND exercise_id = %s", (routine_id, exercise_id))
        
        conn.commit()
        return {"mensaje": "Ejercicio eliminado con éxito"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# ==========================================================
# RUTA PARA ELIMINAR UNA RUTINA COMPLETA 🗑️
# ==========================================================
@app.delete("/rutinas/{routine_id}")
def eliminar_rutina_completa(routine_id: int, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500, detail="Error de BD")
    try:
        cursor = conn.cursor()
        
        # 1. Verificar que la rutina sea del usuario
        cursor.execute("SELECT routine_id FROM routines WHERE routine_id = %s AND user_id = %s", (routine_id, usuario_actual_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tienes permiso")

        # 2. VACIAR EL FOLDER: Borramos las relaciones con los ejercicios primero
        cursor.execute("DELETE FROM routine_exercises WHERE routine_id = %s", (routine_id,))
        
        # 3. BOTAR EL FOLDER: Ahora sí borramos la rutina
        cursor.execute("DELETE FROM routines WHERE routine_id = %s", (routine_id,))
        
        conn.commit()
        return {"mensaje": "Rutina eliminada para siempre"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@app.get("/ejercicios")
def obtener_ejercicios(): # Esta es pública, todos ven los mismos ejercicios
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT exercise_id, name, muscle_group FROM exercises ORDER BY name ASC;")
        return cursor.fetchall()
    finally:
        if conn: conn.close()

@app.get("/rutinas/{routine_id}/ejercicios")
def obtener_ejercicios_de_rutina(routine_id: int, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Aseguramos que la rutina sea del usuario para que no espíe otras rutinas
        cursor.execute("""
            SELECT e.exercise_id, e.name, e.muscle_group, re.order_index 
            FROM exercises e
            JOIN routine_exercises re ON e.exercise_id = re.exercise_id
            JOIN routines r ON re.routine_id = r.routine_id
            WHERE re.routine_id = %s AND r.user_id = %s ORDER BY re.order_index ASC;
        """, (routine_id, usuario_actual_id))
        return cursor.fetchall()
    finally:
        if conn: conn.close()

class SetLog(BaseModel):
    exercise_name: str  
    weight: float
    reps: int
    unit: str

class WorkoutLog(BaseModel):
    routine_id: Optional[int] = None
    duration_minutes: int
    sets: List[SetLog]

@app.post("/entrenamientos")
def guardar_entrenamiento(workout: WorkoutLog, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO workouts (user_id, routine_id, start_time, end_time)
            VALUES (%s, %s, CURRENT_TIMESTAMP - %s::interval, CURRENT_TIMESTAMP) RETURNING workout_id;
        """, (usuario_actual_id, workout.routine_id, f"{workout.duration_minutes} minutes"))
        w_id = extract_id(cursor.fetchone(), 'workout_id', 0)

        for i, s in enumerate(workout.sets):
            cursor.execute("SELECT exercise_id FROM exercises WHERE name = %s", (s.exercise_name,))
            res_e = cursor.fetchone()
            e_id = extract_id(res_e, 'exercise_id', 0) if res_e else None
            
            if not e_id:
                cursor.execute("INSERT INTO exercises (name, muscle_group) VALUES (%s, 'Otro') RETURNING exercise_id;", (s.exercise_name,))
                e_id = extract_id(cursor.fetchone(), 'exercise_id', 0)

            p_std = s.weight * 0.453592 if s.unit == 'lbs' else s.weight
            
            cursor.execute("""
                INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, input_weight, weight_unit, standardized_weight_kg)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (w_id, e_id, i + 1, s.reps, s.weight, s.unit, p_std))

        conn.commit()
        return {"mensaje": "¡Entrenamiento guardado!"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

# ==========================================================
# 7. RUTAS DE ANÁLISIS 
# ==========================================================
@app.get("/analisis/peso-historial")
def historial_peso(usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT weight_kg, TO_CHAR(logged_at, 'DD/MM') as fecha FROM body_weight_log WHERE user_id = %s ORDER BY logged_at ASC LIMIT 10;", (usuario_actual_id,))
        return cursor.fetchall()
    finally:
        if conn: conn.close()

@app.get("/analisis/volumen-musculo")
def volumen_por_musculo(usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT e.muscle_group, SUM(ws.reps * ws.standardized_weight_kg) as volumen
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.exercise_id
            JOIN workouts w ON ws.workout_id = w.workout_id
            WHERE w.user_id = %s
            GROUP BY e.muscle_group
            ORDER BY volumen DESC;
        """, (usuario_actual_id,))
        return cursor.fetchall()
    finally:
        if conn: conn.close()

# ==========================================================
# RUTAS RECUPERADAS (MARCA A VENCER Y PROGRESO)
# ==========================================================
@app.get("/marca")
def obtener_marca(ejercicio: str, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ws.input_weight, ws.reps, ws.weight_unit
            FROM workout_sets ws
            JOIN exercises e ON ws.exercise_id = e.exercise_id
            JOIN workouts w ON ws.workout_id = w.workout_id
            WHERE e.name = %s AND w.user_id = %s
            ORDER BY ws.standardized_weight_kg DESC, ws.reps DESC
            LIMIT 1;
        """, (ejercicio, usuario_actual_id))
        resultado = cursor.fetchone()
        if resultado:
            return {
                "weight": extract_id(resultado, 'input_weight', 0),
                "reps": extract_id(resultado, 'reps', 1),
                "unit": extract_id(resultado, 'weight_unit', 2)
            }
        return None
    finally:
        if conn: conn.close()

@app.get("/analisis/progreso-ejercicio")
def progreso_ejercicio(nombre: str, usuario_actual_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None: raise HTTPException(status_code=500)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT MAX(ws.standardized_weight_kg) as max_weight, TO_CHAR(w.start_time, 'DD/MM') as fecha
            FROM workout_sets ws
            JOIN workouts w ON ws.workout_id = w.workout_id
            JOIN exercises e ON ws.exercise_id = e.exercise_id
            WHERE e.name = %s AND w.user_id = %s
            GROUP BY w.start_time
            ORDER BY w.start_time ASC;
        """, (nombre, usuario_actual_id))
        return cursor.fetchall()
    finally:
        if conn: conn.close()