import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  
  const [resumen, setResumen] = useState({ peso_actual: 0, ultimo_entreno: 'Cargando...', total_entrenos: 0 });
  const [nuevoPeso, setNuevoPeso] = useState('');
  
  const [rutinasDb, setRutinasDb] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState('');
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');

  // 🔥 ESTADOS DEL CONSTRUCTOR DE RUTINAS
  const [ejerciciosGlobales, setEjerciciosGlobales] = useState([]);
  const [ejerciciosDeRutina, setEjerciciosDeRutina] = useState([]);
  const [ejercicioAAgregar, setEjercicioAAgregar] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('gym_token');
    if (!token) { navigate('/login'); return null; }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) return;

    fetch('http://localhost:8000/resumen', { headers }).then(res => res.json()).then(data => setResumen(data)).catch(() => cerrarSesion());
    fetch('http://localhost:8000/rutinas', { headers }).then(res => res.json()).then(data => setRutinasDb(data));
    fetch('http://localhost:8000/ejercicios', { headers }).then(res => res.json()).then(data => setEjerciciosGlobales(data));
  }, [navigate]);

  // 🔥 EFECTO MAGNÉTICO: Traer los ejercicios de la rutina cuando la seleccionas
  useEffect(() => {
    if (selectedRoutine) {
      const headers = getAuthHeaders();
      fetch(`http://localhost:8000/rutinas/${selectedRoutine}/ejercicios`, { headers })
        .then(res => res.json())
        .then(data => setEjerciciosDeRutina(data))
        .catch(console.error);
    } else {
      setEjerciciosDeRutina([]);
    }
  }, [selectedRoutine]);

  const iniciarRutina = () => {
    if (selectedRoutine) navigate(`/app/entrenar?rutina=${selectedRoutine}`);
  };

  const registrarPeso = async (e) => {
    e.preventDefault(); 
    if(!nuevoPeso) return;
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch('http://localhost:8000/peso', { method: 'POST', headers, body: JSON.stringify({ peso: parseFloat(nuevoPeso) }) });
    if(response.ok) { setResumen({...resumen, peso_actual: parseFloat(nuevoPeso)}); setNuevoPeso(''); }
  };

  const guardarNuevaRutina = async () => {
    if (newRoutineName.trim() === '') return;
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch('http://localhost:8000/rutinas', { method: 'POST', headers, body: JSON.stringify({ name: newRoutineName }) });
    if (response.ok) {
      const data = await response.json();
      const nuevaRutina = { routine_id: data.routine_id, name: data.name };
      setRutinasDb([...rutinasDb, nuevaRutina]);
      setSelectedRoutine(nuevaRutina.routine_id);
      setIsCreatingRoutine(false);
      setNewRoutineName('');
    }
  };

  // 🔥 FUNCIÓN PARA AGREGAR EL EJERCICIO A LA BD
  const agregarEjercicio = async () => {
    if (!ejercicioAAgregar || !selectedRoutine) return;
    const headers = getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`http://localhost:8000/rutinas/${selectedRoutine}/ejercicios`, {
      method: 'POST', headers, body: JSON.stringify({ exercise_id: parseInt(ejercicioAAgregar) })
    });

    if (response.ok) {
      // Refrescamos visualmente la lista de la rutina
      const ejercicioCompleto = ejerciciosGlobales.find(e => e.exercise_id === parseInt(ejercicioAAgregar));
      setEjerciciosDeRutina([...ejerciciosDeRutina, ejercicioCompleto]);
      setEjercicioAAgregar(''); // Limpiamos el selector
    } else {
      alert("Error agregando el ejercicio");
    }
  };

  // 🔥 FUNCIÓN PARA ELIMINAR EJERCICIO DE LA RUTINA
  const eliminarEjercicio = async (exerciseId) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`http://localhost:8000/rutinas/${selectedRoutine}/ejercicios/${exerciseId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Magia visual: filtramos la lista para que desaparezca al instante sin recargar
        setEjerciciosDeRutina(ejerciciosDeRutina.filter(ej => ej.exercise_id !== exerciseId));
      } else {
        alert("Error al eliminar el ejercicio");
      }
    } catch (error) {
      console.error("Error conectando:", error);
    }
  };

// 🔥 FUNCIÓN PARA ELIMINAR LA RUTINA COMPLETA
  const eliminarRutina = async () => {
    if (!selectedRoutine) return;
    
    // Alerta de seguridad para evitar tragedias
    const confirmar = window.confirm("¿Estás seguro de que quieres eliminar esta rutina para siempre? 💥");
    if (!confirmar) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`http://localhost:8000/rutinas/${selectedRoutine}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Limpiamos la interfaz al instante
        setRutinasDb(rutinasDb.filter(r => r.routine_id !== parseInt(selectedRoutine)));
        setSelectedRoutine(''); // Deseleccionamos
        setEjerciciosDeRutina([]); // Vaciamos la vista
      } else {
        alert("Error al eliminar la rutina.");
      }
    } catch (error) {
      console.error("Error conectando:", error);
    }
  };


  const cerrarSesion = () => { localStorage.removeItem('gym_token'); navigate('/login'); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: '#f3f4f6' }}>Tu Resumen 📈</h2>
        <button onClick={cerrarSesion} style={styles.logoutBtn}>🚪 Salir</button>
      </div>
      
      <section style={styles.profileCard}>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}><p style={styles.statLabel}>Último Entreno</p><p style={styles.statValue}>{resumen.ultimo_entreno}</p></div>
          <div style={styles.statBox}><p style={styles.statLabel}>Peso</p><p style={styles.statValue}>{resumen.peso_actual} kg</p></div>
          <div style={styles.statBox}><p style={styles.statLabel}>Totales</p><p style={styles.statValue}>{resumen.total_entrenos}</p></div>
        </div>
        <form onSubmit={registrarPeso} style={styles.weightForm}>
          <input type="number" step="0.1" placeholder="Registrar peso (ej. 76.2)" value={nuevoPeso} onChange={(e) => setNuevoPeso(e.target.value)} style={styles.weightInput} />
          <button type="submit" style={styles.weightBtn}>Guardar</button>
        </form>
      </section>

      <section style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#f3f4f6' }}>¿Qué entrenamos hoy?</h3>
          <button onClick={() => setIsCreatingRoutine(!isCreatingRoutine)} style={isCreatingRoutine ? styles.cancelBtn : styles.addBtn}>
            {isCreatingRoutine ? '✕ Cancelar' : '+ Crear Rutina'}
          </button>
        </div>

        <div style={styles.actionGrid}>
          <Link to="/app/entrenar" style={styles.primaryAction}>⚡ Entrenamiento Libre</Link>
          
          {isCreatingRoutine ? (
            <div style={styles.newRoutineBox}>
              <input type="text" placeholder="Nombre (ej. Día de Pierna)" value={newRoutineName} onChange={(e) => setNewRoutineName(e.target.value)} style={styles.routineInput} autoFocus />
              <button onClick={guardarNuevaRutina} style={styles.saveRoutineBtn}>Guardar</button>
            </div>
          ) : (
            <select value={selectedRoutine} onChange={(e) => setSelectedRoutine(e.target.value)} style={styles.routineDropdown}>
              <option value="" disabled>Selecciona una rutina guardada...</option>
              {rutinasDb.map((rutina) => ( <option key={rutina.routine_id} value={rutina.routine_id}>{rutina.name}</option> ))}
            </select>
          )}

          {/* 🔥 EL CONSTRUCTOR DE RUTINAS (Aparece al seleccionar una) */}
          {selectedRoutine && !isCreatingRoutine && (
            <div style={styles.builderCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>Ejercicios en esta rutina:</h4>
                <button onClick={eliminarRutina} style={styles.deleteRoutineBtn}>
                  🗑️ Borrar Rutina
                </button>
              </div>              
              {ejerciciosDeRutina.length > 0 ? (
                <ul style={styles.exerciseList}>
                  {ejerciciosDeRutina.map((ej, index) => (
                    <li key={index} style={styles.exerciseItem}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={styles.exerciseNumber}>{index + 1}</span> 
                        {ej.name}
                      </div>
                      <button 
                        onClick={() => eliminarEjercicio(ej.exercise_id)} 
                        style={styles.deleteExerciseBtn}
                        title="Quitar ejercicio"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={styles.emptyRoutineText}>Esta rutina está vacía. Añade tu primer ejercicio abajo 👇</p>
              )}

              <div style={styles.addExerciseForm}>
                <select value={ejercicioAAgregar} onChange={(e) => setEjercicioAAgregar(e.target.value)} style={styles.builderDropdown}>
                  <option value="" disabled>Selecciona un ejercicio del catálogo...</option>
                  {ejerciciosGlobales.map(ej => ( <option key={ej.exercise_id} value={ej.exercise_id}>{ej.name}</option> ))}
                </select>
                <button onClick={agregarEjercicio} style={styles.addExerciseBtn}>+ Añadir</button>
              </div>
            </div>
          )}

          {selectedRoutine && !isCreatingRoutine && (
            <button onClick={iniciarRutina} style={styles.successAction}>▶️ Empezar Rutina Seleccionada</button>
          )}
        </div>
      </section>
      {/* 🔥 NUEVO BOTÓN DE LA TIENDA JUSTO DEBAJO */}
      <Link to="/app/tienda" style={styles.shopBanner}>
        ⚡ Potencia tus entrenamientos 🛒
      </Link>
    </div>
  );
}

// 🎨 ESTILOS 
const styles = {
  container: { padding: '20px 15px', width: '100%', boxSizing: 'border-box', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#111827', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  logoutBtn: { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  profileCard: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', marginBottom: '20px', border: '1px solid #4b5563' },
  card: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #374151' },
  statsGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }, 
  statBox: { flex: '1 1 30%', backgroundColor: '#374151', padding: '15px 10px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' },
  statLabel: { margin: '0 0 5px 0', color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { margin: '0', color: '#10b981', fontSize: '18px', fontWeight: 'bold' },
  weightForm: { display: 'flex', gap: '10px' },
  weightInput: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#111827', color: 'white', fontSize: '15px', minWidth: 0 },
  weightBtn: { padding: '12px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 },
  actionGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  primaryAction: { padding: '15px', backgroundColor: '#3b82f6', color: 'white', textAlign: 'center', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'block' },
  successAction: { padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  routineDropdown: { padding: '14px', borderRadius: '8px', border: '1px solid #4b5563', fontSize: '15px', backgroundColor: '#374151', color: '#f3f4f6', cursor: 'pointer' },
  addBtn: { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  cancelBtn: { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  newRoutineBox: { display: 'flex', gap: '10px', backgroundColor: '#111827', padding: '10px', borderRadius: '8px', border: '1px dashed #60a5fa' },
  routineInput: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#1f2937', color: 'white', fontSize: '15px' },
  saveRoutineBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' },
  
  // 🔥 Estilos del Constructor
  builderCard: { backgroundColor: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid #374151', marginTop: '5px' },
  builderTitle: { margin: '0 0 10px 0', fontSize: '14px', color: '#9ca3af' },
  emptyRoutineText: { fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginBottom: '15px' },
  exerciseList: { listStyleType: 'none', padding: 0, margin: '0 0 15px 0' },
  exerciseItem: { padding: '8px 10px', backgroundColor: '#1f2937', marginBottom: '5px', borderRadius: '6px', fontSize: '14px', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' },
  exerciseNumber: { backgroundColor: '#374151', color: '#9ca3af', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  addExerciseForm: { display: 'flex', gap: '10px', width: '100%' },
  builderDropdown: { 
    flex: 1, 
    minWidth: 0, // 🔥 La magia: deja que el select se encoja sin empujar al botón
    padding: '10px', 
    borderRadius: '6px', 
    border: '1px solid #4b5563', 
    backgroundColor: '#374151', 
    color: 'white', 
    fontSize: '14px' 
  },
  addExerciseBtn: { 
    flexShrink: 0, // 🔥 Evita que el botón se aplaste
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    padding: '0 15px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '14px' 
  },

  // Agrega este estilo justo debajo de exerciseItem o donde prefieras
  deleteExerciseBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444', // Rojo peligro
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },

  // 🔥 ESTILO DEL BANNER DE LA TIENDA
  shopBanner: {
    display: 'block',
    marginTop: '20px',
    padding: '18px',
    backgroundColor: 'rgba(168, 85, 247, 0.15)', // Púrpura translúcido
    border: '1px dashed #a855f7',
    borderRadius: '12px',
    color: '#d8b4fe',
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.2)',
    cursor: 'pointer'
  },

  // Estilo para el botón de borrar rutina
  deleteRoutineBtn: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default Home;