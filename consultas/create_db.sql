
-- ==========================================================
-- FASE 1: TABLAS PRINCIPALES (No dependen de nadie)
-- ==========================================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Listo para la seguridad JWT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
    exercise_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    muscle_group VARCHAR(50),
    description TEXT
);

-- ==========================================================
-- FASE 2: TABLAS SECUNDARIAS (Dependen de los Usuarios)
-- ==========================================================

CREATE TABLE body_weight_log (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routines (
    routine_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
    workout_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- ==========================================================
-- FASE 3: TABLAS DE DETALLE (El corazón de la aplicación)
-- ==========================================================

CREATE TABLE routine_exercises (
    routine_id INT REFERENCES routines(routine_id) ON DELETE CASCADE,
    exercise_id INT REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    default_sets INT DEFAULT 3,
    PRIMARY KEY (routine_id, exercise_id)
);

CREATE TABLE workout_sets (
    set_id SERIAL PRIMARY KEY,
    workout_id INT REFERENCES workouts(workout_id) ON DELETE CASCADE,
    exercise_id INT REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    set_number INT NOT NULL,
    reps INT NOT NULL,
    input_weight DECIMAL(5,2) NOT NULL,
    weight_unit VARCHAR(3) CHECK (weight_unit IN ('kg', 'lbs')),
    standardized_weight_kg DECIMAL(5,2) NOT NULL,
    rest_time_seconds INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- FASE 4: INYECCIÓN DE DATOS DE PRUEBA (MOCK DATA)
-- ==========================================================

-- 1. Creamos tu usuario
INSERT INTO users (username, email, password_hash) 
VALUES ('atleta_pro', 'atleta@gym.com', 'hash_simulado_123');

-- 2. Metemos dos ejercicios al catálogo
INSERT INTO exercises (name, muscle_group) 
VALUES ('Sentadilla', 'Pierna'), ('Press de Banca', 'Pecho');

-- 3. Registramos tu peso actual
INSERT INTO body_weight_log (user_id, weight_kg) 
VALUES (1, 75.5);

-- 4. Creamos una rutina predefinida
INSERT INTO routines (user_id, name) 
VALUES (1, '🔥 Día de Pierna Pesado');

-- 5. Le asignamos la Sentadilla a esa rutina
INSERT INTO routine_exercises (routine_id, exercise_id, order_index, default_sets) 
VALUES (1, 1, 1, 4);

-- ==========================================================
-- FASE 5: CREACION DE FASE 2 (TIENDA VIRTUAL)
-- ==========================================================
-- 1. TABLA DE PRODUCTOS (El Catálogo real)
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    accent_color VARCHAR(20), -- Para mantener el diseño neón que hicimos
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. TABLA DE PEDIDOS (Orders)
-- Aquí está la magia: user_id puede estar vacío (NULL) si es un invitado
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL, 
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 15000, -- Costo base de envío (ej. $15.000)
    discount DECIMAL(10, 2) DEFAULT 0, -- Aquí va el bono del envío gratis
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, SHIPPED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE DETALLES DEL PEDIDO (Order Items)
-- Qué productos exactos compró en ese pedido
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);