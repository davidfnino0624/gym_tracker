-- ==========================================================
-- 1. INYECTAR TU CATÁLOGO COMPLETO DE EJERCICIOS (LOS 6 DÍAS)
-- ==========================================================

INSERT INTO exercises (name, muscle_group) VALUES 
-- De Empuje 1 y 2
('Press inclinado con mancuernas', 'Pecho'),
('Press plano con mancuernas', 'Pecho'),
('Press Militar Unilateral (Mancuerna)', 'Hombro'),
('Elevaciones laterales', 'Hombro'),
('Extensión Tríceps Unilateral Polea', 'Tríceps'),
('Fondos (Dips)', 'Compuesto'),
('Press inclinado con barra', 'Pecho'),
('Peck deck', 'Pecho'),
('Press Arnold (Hombro Completo)', 'Hombro'),
('Patada Tríceps / Copa (Cabeza Larga)', 'Tríceps'),
('Flexiones de pecho', 'Pecho'),

-- De Tracción 1 y 2
('Dominadas', 'Espalda'),
('Jalon al pecho', 'Espalda'),
('Jalon al Pecho Agarre Neutro (Estrecho)', 'Espalda'),
('Face pull', 'Hombro'),
('Curl Araña', 'Bíceps'),
('Curl martillo polea', 'Bíceps'),
('Remo con Mancuerna (Unilateral)', 'Espalda'),
('Remo Pendlay Barra ', 'Espalda'),
('Remo en maquina agarre neutro', 'Espalda'),
('Encogimientos', 'Espalda'),
('Curl Barra Z', 'Bíceps'),
('Curl concentrado', 'Bíceps'),
('Pull over polea alta', 'Espalda'),
('Fly invertido maquina', 'Hombro'), 
('Curl de biceps en polea', 'Bíceps'),
('Curl martillo con mancuernas', 'Bíceps'),

-- De Pierna 1 y 2
('Squat', 'Pierna'),
('Hack squat', 'Pierna'),
('Peso muerto rumano (Mancuernas)', 'Pierna'),
('Zancadas', 'Pierna'), -- ¡Faltaba esta coma!
('Extensión de Cuádriceps', 'Pierna'),
('Curl Femoral (Tumbado)', 'Pierna'),
('Elevación de Talones', 'Pierna'),
('Peso muerto', 'Pierna'),
('Prensa pierna', 'Pierna'),
('Hip Thrust', 'Pierna'),
('Sentadilla Búlgara', 'Pierna'),
('Pantorrilla sentado', 'Pierna'),
('Curl Femoral (Sentado)', 'Pierna') -- Le quité la coma extra que tenía al final
ON CONFLICT (name) DO NOTHING; 

-- ==========================================================
-- 2. CREAR TUS 6 BLOQUES DE RUTINA
-- ==========================================================

INSERT INTO routines (user_id, name) VALUES 
(1, '🔥 Empuje 1'),
(1, '🦍 Tracción 1'),
(1, '🦵 Pierna 1'),
(1, '🔥 Empuje 2'),
(1, '🦍 Tracción 2'),
(1, '🦵 Pierna 2');

-- ==========================================================
-- 3. ARMAR EL ORDEN Y LAS SERIES EXACTAS DE CADA BLOQUE
-- ==========================================================

-- 🟢 EMPUJE 1
WITH R AS (SELECT routine_id FROM routines WHERE name = '🔥 Empuje 1' ORDER BY routine_id DESC LIMIT 1)
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) VALUES 
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Press inclinado con mancuernas'), 1, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Press plano con mancuernas'), 2, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Press Militar Unilateral (Mancuerna)'), 3, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Elevaciones laterales'), 4, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Extensión Tríceps Unilateral Polea'), 5, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Fondos (Dips)'), 6, 3);

-- 🟢 TRACCIÓN 1
WITH R AS (SELECT routine_id FROM routines WHERE name = '🦍 Tracción 1' ORDER BY routine_id DESC LIMIT 1)
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) VALUES 
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Dominadas'), 1, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Jalon al pecho'), 2, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Jalon al Pecho Agarre Neutro (Estrecho)'), 3, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Face pull'), 4, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Curl Araña'), 5, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Curl martillo polea'), 6, 3);

-- 🟢 PIERNA 1
WITH R AS (SELECT routine_id FROM routines WHERE name = '🦵 Pierna 1' ORDER BY routine_id DESC LIMIT 1)
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) VALUES 
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Squat'), 1, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Hack squat'), 2, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Peso muerto rumano (Mancuernas)'), 3, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Zancadas'), 4, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Extensión de Cuádriceps'), 5, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Curl Femoral (Tumbado)'), 6, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Elevación de Talones'), 7, 4);

-- 🟢 EMPUJE 2
WITH R AS (SELECT routine_id FROM routines WHERE name = '🔥 Empuje 2' ORDER BY routine_id DESC LIMIT 1)
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) VALUES 
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Press inclinado con barra'), 1, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Peck deck'), 2, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Press Arnold (Hombro Completo)'), 3, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Elevaciones laterales'), 4, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Patada Tríceps / Copa (Cabeza Larga)'), 5, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Flexiones de pecho'), 6, 3);

-- 🟢 TRACCIÓN 2
WITH R AS (SELECT routine_id FROM routines WHERE name = '🦍 Tracción 2' ORDER BY routine_id DESC LIMIT 1)
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) VALUES 
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Remo Pendlay Barra '), 1, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Remo con Mancuerna (Unilateral)'), 2, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Remo en maquina agarre neutro'), 3, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Encogimientos'), 4, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Curl Barra Z'), 5, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Curl concentrado'), 6, 3);

-- 🟢 PIERNA 2
WITH R AS (SELECT routine_id FROM routines WHERE name = '🦵 Pierna 2' ORDER BY routine_id DESC LIMIT 1)
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) VALUES 
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Peso muerto'), 1, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Prensa pierna'), 2, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Hip Thrust'), 3, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Sentadilla Búlgara'), 4, 3),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Pantorrilla sentado'), 5, 4),
((SELECT routine_id FROM R), (SELECT exercise_id FROM exercises WHERE name = 'Curl Femoral (Sentado)'), 6, 3);