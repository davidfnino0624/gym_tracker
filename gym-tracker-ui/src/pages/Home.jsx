import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  
  // 🔥 ESTADOS REALES DESDE LA BASE DE DATOS
  const [resumen, setResumen] = useState({
    peso_actual: 0,
    ultimo_entreno: 'Cargando...',
    total_entrenos: 0
  });
  
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [rutinasDb, setRutinasDb] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState('');

  // 1. Traer el resumen y las rutinas al cargar la página
  useEffect(() => {
    // Fetch del Resumen (Peso, fechas, etc)
    fetch('http://localhost:8000/resumen')
      .then(res => res.json())
      .then(data => setResumen(data))
      .catch(err => console.error("Error trayendo resumen:", err));

    // Fetch de las Rutinas
    fetch('http://localhost:8000/rutinas')
      .then((respuesta) => respuesta.json())
      .then((datos) => setRutinasDb(datos))
      .catch((error) => console.error("Error trayendo rutinas:", error));
  }, []);

  const iniciarRutina = () => {
    if (selectedRoutine) {
      navigate(`/app/entrenar?rutina=${selectedRoutine}`);
    }
  };

  // 🔥 2. Función para guardar el peso REAL en la base de datos
  const registrarPeso = async (e) => {
    e.preventDefault(); 
    if(!nuevoPeso) return;

    try {
      const response = await fetch('http://localhost:8000/peso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso: parseFloat(nuevoPeso) })
      });

      if(response.ok) {
        // Actualizamos la UI al instante
        setResumen({...resumen, peso_actual: parseFloat(nuevoPeso)});
        setNuevoPeso('');
      } else {
        alert("Hubo un error guardando el peso");
      }
    } catch (error) {
      console.error("Error conectando:", error);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 📊 SECCIÓN 1: Resumen del Atleta */}
      <section style={styles.profileCard}>
        <h2 style={{ margin: '0 0 15px 0', color: '#f3f4f6' }}>Tu Resumen 📈</h2>
        
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Último Entreno</p>
            <p style={styles.statValue}>{resumen.ultimo_entreno}</p>
          </div>
          
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Peso Corporal</p>
            <p style={styles.statValue}>{resumen.peso_actual} kg</p>
          </div>

          <div style={styles.statBox}>
            <p style={styles.statLabel}>Entrenos Totales</p>
            <p style={styles.statValue}>{resumen.total_entrenos}</p>
          </div>
        </div>

        {/* Formulario de Peso Conectado */}
        <form onSubmit={registrarPeso} style={styles.weightForm}>
          <input 
            type="number" 
            step="0.1"
            placeholder="Registrar nuevo peso (ej. 76.2)" 
            value={nuevoPeso}
            onChange={(e) => setNuevoPeso(e.target.value)}
            style={styles.weightInput}
          />
          <button type="submit" style={styles.weightBtn}>Guardar</button>
        </form>
      </section>

      {/* 🏋️‍♂️ SECCIÓN 2: ¿Qué hacemos hoy? */}
      <section style={styles.card}>
        <h3 style={{ margin: '0 0 15px 0', color: '#f3f4f6' }}>¿Qué entrenamos hoy?</h3>
        
        <div style={styles.actionGrid}>
          <Link to="/app/entrenar" style={styles.primaryAction}>
            ⚡ Iniciar Entrenamiento Libre
          </Link>

          <select 
            value={selectedRoutine} 
            onChange={(e) => setSelectedRoutine(e.target.value)} 
            style={styles.routineDropdown}
          >
            <option value="" disabled>Selecciona una rutina guardada...</option>
            {rutinasDb.length === 0 ? (
              <option disabled>Cargando tus rutinas...</option>
            ) : (
              rutinasDb.map((rutina) => (
                <option key={rutina.routine_id} value={rutina.routine_id}>
                  {rutina.name}
                </option>
              ))
            )}
          </select>

          {selectedRoutine && (
            <button onClick={iniciarRutina} style={styles.successAction}>
              ▶️ Empezar Rutina Seleccionada
            </button>
          )}
        </div>
      </section>

    </div>
  );
}

// 🎨 ESTILOS (Añadí soporte para la 3ra cajita de stats)
const styles = {
  container: { padding: '20px 15px', width: '100%', boxSizing: 'border-box', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#111827', minHeight: '100vh' },
  profileCard: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', marginBottom: '20px', border: '1px solid #4b5563' },
  card: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #374151' },
  statsGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }, // FlexWrap para que no se apriete en celulares
  statBox: { flex: '1 1 30%', backgroundColor: '#374151', padding: '15px 10px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' },
  statLabel: { margin: '0 0 5px 0', color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { margin: '0', color: '#10b981', fontSize: '18px', fontWeight: 'bold' },
  weightForm: { display: 'flex', gap: '10px' },
  weightInput: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#111827', color: 'white', fontSize: '15px', minWidth: 0 },
  weightBtn: { padding: '12px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 },
  actionGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  primaryAction: { padding: '15px', backgroundColor: '#3b82f6', color: 'white', textAlign: 'center', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'block' },
  successAction: { padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  routineDropdown: { padding: '14px', borderRadius: '8px', border: '1px solid #4b5563', fontSize: '15px', backgroundColor: '#374151', color: '#f3f4f6', cursor: 'pointer' },
};

export default Home;