-- ==========================================================
-- 1. ACTUALIZAR TU PERFIL DE USUARIO
-- Cambia 'Tu Nombre' y el correo por tus datos reales.
-- ==========================================================
UPDATE users 
SET username = 'David Kid', 
    email = 'davidnino0624@gmail.com'
WHERE user_id = 1;

-- ==========================================================
-- 2. LIMPIAR DATOS BASURA (HISTORIAL FALSO)
-- Esto borra los pesos o entrenamientos de prueba, pero DEJA INTACTAS tus rutinas
-- ==========================================================
DELETE FROM body_weight_log WHERE user_id = 1;
DELETE FROM workouts WHERE user_id = 1;

-- ==========================================================
-- 3. REGISTRAR TU PESO CORPORAL REAL HOY
-- Cambia el 75.5 por tu peso actual en kg.
-- ==========================================================
INSERT INTO body_weight_log (user_id, weight, date) 
VALUES (1, 78.5, CURRENT_DATE);