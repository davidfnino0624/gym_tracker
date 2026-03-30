import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function WorkoutLogger() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rutinaId = searchParams.get('rutina'); 
  const [startTime] = useState(Date.now());

  const [ejerciciosDb, setEjerciciosDb] = useState([]);
  const [ejercicioActivo, setEjercicioActivo] = useState('');
  const [nombreRutina, setNombreRutina] = useState('Cargando...');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('Pecho'); 
  const [sets, setSets] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [unit, setUnit] = useState('kg');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [marcaAVencer, setMarcaAVencer] = useState(null);

  // Helper de seguridad
  const getAuthHeaders = () => {
    const token = localStorage.getItem('gym_token');
    if (!token) { navigate('/login'); return null; }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) return;

    // Le preguntamos primero por los ejercicios específicos de la rutina
    const urlApi = rutinaId ? `http://localhost:8000/rutinas/${rutinaId}/ejercicios` : 'http://localhost:8000/ejercicios';
    
    fetch(urlApi, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Si la rutina ya tiene ejercicios, los usamos
          setEjerciciosDb(data);
          setEjercicioActivo(data[0].name); 
        } else if (rutinaId) {
          // 🔥 EL TRUCO: Si la rutina es nueva y está vacía, le traemos TODO el catálogo global
          fetch('http://localhost:8000/ejercicios', { headers })
            .then(res2 => res2.json())
            .then(dataGlobal => {
              setEjerciciosDb(dataGlobal);
              if (dataGlobal.length > 0) setEjercicioActivo(dataGlobal[0].name);
            });
        }
      })
      .catch(console.error);

    // Fetch para traer el nombre de la rutina (esto se queda igual)
    if (rutinaId) {
      fetch('http://localhost:8000/rutinas', { headers })
        .then(res => res.json())
        .then(datos => {
          const r = datos.find(d => d.routine_id.toString() === rutinaId);
          setNombreRutina(r ? r.name : '⚡ Entrenamiento Libre');
        }).catch(() => setNombreRutina('⚡ Entrenamiento Libre'));
    } else {
      setNombreRutina('⚡ Entrenamiento Libre');
    }
  }, [rutinaId, navigate]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    else if (timeLeft === 0 && isTimerActive) setIsTimerActive(false);
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (ejercicioActivo) {
      const headers = getAuthHeaders();
      if (!headers) return;

      fetch(`http://localhost:8000/marca?ejercicio=${encodeURIComponent(ejercicioActivo)}`, { headers })
        .then(res => res.json())
        .then(data => setMarcaAVencer(data))
        .catch(() => setMarcaAVencer(null));
    }
  }, [ejercicioActivo, navigate]);

  const toggleUnit = () => setUnit(unit === 'kg' ? 'lbs' : 'kg');

  const handleCrearEjercicio = () => {
    if (newExerciseName.trim() === '') return;
    const nuevoEjercicio = { exercise_id: `temp_${Date.now()}`, name: newExerciseName, muscle_group: newExerciseMuscle };
    setEjerciciosDb([...ejerciciosDb, nuevoEjercicio]);
    setEjercicioActivo(nuevoEjercicio.name);
    setIsAddingExercise(false);
    setNewExerciseName('');
  };

  const addSet = () => {
    if (currentWeight && currentReps) {
      setSets([...sets, { id: Date.now(), setNumber: sets.filter(s => s.exerciseName === ejercicioActivo).length + 1, exerciseName: ejercicioActivo, weight: parseFloat(currentWeight), unit: unit, reps: parseInt(currentReps) }]);
      setCurrentReps(''); setTimeLeft(90); setIsTimerActive(true);
    }
  };

  const finalizarEntrenamiento = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const payload = {
      routine_id: rutinaId ? parseInt(rutinaId) : null,
      duration_minutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
      sets: sets.map(s => ({ exercise_name: s.exerciseName, weight: s.weight, reps: s.reps, unit: s.unit }))
    };

    try {
      const response = await fetch('http://localhost:8000/entrenamientos', { method: 'POST', headers, body: JSON.stringify(payload) });
      if (response.ok) {
        alert("¡Entrenamiento guardado en la base de datos como un campeón! 🏆");
        navigate('/app'); 
      } else {
        const errorData = await response.json();
        alert("Error guardando: " + errorData.detail);
      }
    } catch (error) { alert("Error de conexión con el servidor."); }
  };

  const indiceActual = ejerciciosDb.findIndex(ej => ej.name === ejercicioActivo) + 1;
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/app')} style={styles.backBtn}>← Atrás</button>
        <h2 style={styles.routineTitle}>{nombreRutina}</h2>
      </header>

      <div style={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <label style={styles.label}>Ejercicio Actual:</label>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            {rutinaId && ejerciciosDb.length > 0 && !isAddingExercise && ( <span style={styles.progressBadge}>{indiceActual} de {ejerciciosDb.length}</span> )}
            <button onClick={() => setIsAddingExercise(!isAddingExercise)} style={isAddingExercise ? styles.cancelBtn : styles.addExerciseBtn}>
              {isAddingExercise ? '✕ Cancelar' : '+ Nuevo'}
            </button>
          </div>
        </div>

        {isAddingExercise ? (
          <div style={styles.newExerciseForm}>
            <input type="text" placeholder="Ej. Curl de Bíceps" value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} style={styles.inputDark} />
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
              <select value={newExerciseMuscle} onChange={(e) => setNewExerciseMuscle(e.target.value)} style={{...styles.dropdownDark, flex: 1, marginBottom: 0}}>
                <option value="Pecho">Pecho</option><option value="Espalda">Espalda</option><option value="Pierna">Pierna</option><option value="Hombro">Hombro</option><option value="Bíceps">Bíceps</option><option value="Tríceps">Tríceps</option><option value="Core">Core</option>
              </select>
              <button onClick={handleCrearEjercicio} style={styles.saveExerciseBtn}>Guardar</button>
            </div>
          </div>
        ) : (
          <select value={ejercicioActivo} onChange={(e) => setEjercicioActivo(e.target.value)} style={styles.dropdownDark}>
            {ejerciciosDb.length === 0 ? <option>Cargando...</option> : ejerciciosDb.map((ej, index) => (
                <option key={ej.exercise_id} value={ej.name}>{rutinaId ? `${index + 1}. ` : ''}{ej.name}</option>
            ))}
          </select>
        )}
      </div>

      {!isAddingExercise && (
        <div style={styles.targetCard}>
          <p style={styles.targetTitle}>🎯 Marca a vencer en {ejercicioActivo}</p>
          {marcaAVencer ? ( <p style={styles.targetNumbers}>{marcaAVencer.weight} {marcaAVencer.unit} × {marcaAVencer.reps} reps</p> ) : ( <p style={{ color: '#9ca3af', margin: 0 }}>Sin registros previos.</p> )}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Peso</label>
            <div style={{ display: 'flex' }}><input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} style={styles.inputLeft} /><button onClick={toggleUnit} style={styles.unitToggle}>{unit}</button></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Reps</label>
            <input type="number" value={currentReps} onChange={(e) => setCurrentReps(e.target.value)} style={styles.inputField} />
          </div>
        </div>
        <button onClick={addSet} style={styles.addButton}>+ Completar Set</button>
      </div>

      {isTimerActive && (
        <div style={styles.timerCard}>
          <h3 style={styles.timerTitle}>⏱️ Descanso</h3>
          <div style={styles.timerDisplay}>{formatTime(timeLeft)}</div>
          <div style={styles.timerControls}>
            <button onClick={() => setTimeLeft(t => Math.max(0, t - 30))} style={styles.timerBtn}>-30s</button>
            <button onClick={() => setIsTimerActive(false)} style={styles.timerBtnSkip}>Saltar</button>
            <button onClick={() => setTimeLeft(t => t + 30)} style={styles.timerBtn}>+30s</button>
          </div>
        </div>
      )}

      {sets.length > 0 && (
        <div style={styles.setsContainer}>
          <h3 style={styles.setsTitle}>Series Completadas</h3>
          {sets.map((set) => (
            <div key={set.id} style={styles.setRow}>
              <div style={{display: 'flex', flexDirection: 'column', flex: 1}}><span style={styles.setExerciseName}>{set.exerciseName}</span><span style={styles.setNumber}>Set {set.setNumber}</span></div>
              <span style={styles.setDetails}>{set.weight} {set.unit} × {set.reps}</span><span style={styles.checkIcon}>✅</span>
            </div>
          ))}
        </div>
      )}
      {sets.length > 0 && ( <button onClick={finalizarEntrenamiento} style={styles.finishButton}>🏁 Finalizar Entrenamiento</button> )}
    </div>
  );
}

const styles = {
  container: { padding: '20px 15px', width: '100%', boxSizing: 'border-box', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#111827', minHeight: '100vh', color: 'white' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' },
  backBtn: { background: 'none', border: 'none', color: '#60a5fa', fontSize: '16px', cursor: 'pointer', padding: 0 },
  routineTitle: { margin: 0, fontSize: '20px', color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  card: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid #374151', marginBottom: '15px' },
  label: { display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '0' },
  progressBadge: { backgroundColor: '#3b82f6', color: 'white', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' },
  dropdownDark: { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #4b5563', fontSize: '16px', backgroundColor: '#111827', color: 'white', marginBottom: '15px' },
  addExerciseBtn: { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  cancelBtn: { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  newExerciseForm: { backgroundColor: '#111827', padding: '15px', borderRadius: '8px', border: '1px dashed #60a5fa', marginBottom: '15px' },
  inputDark: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#1f2937', color: 'white', fontSize: '16px', boxSizing: 'border-box' },
  saveExerciseBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' },
  targetCard: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '12px', border: '1px dashed #3b82f6', marginBottom: '20px', textAlign: 'center' },
  targetTitle: { margin: '0 0 5px 0', color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' },
  targetNumbers: { margin: 0, color: '#fcd34d', fontSize: '20px', fontWeight: 'bold' },
  inputRow: { display: 'flex', flexDirection: 'row', gap: '15px', marginBottom: '15px', width: '100%' },
  inputGroup: { flex: 1, minWidth: 0 }, 
  inputField: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#111827', color: 'white', fontSize: '18px', textAlign: 'center', boxSizing: 'border-box' },
  inputLeft: { width: '100%', padding: '12px', borderRadius: '8px 0 0 8px', border: '1px solid #4b5563', borderRight: 'none', backgroundColor: '#111827', color: 'white', fontSize: '18px', textAlign: 'center', boxSizing: 'border-box', minWidth: 0 },
  unitToggle: { width: '60px', padding: '12px 0', borderRadius: '0 8px 8px 0', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#60a5fa', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 },
  addButton: { width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  timerCard: { backgroundColor: '#374151', padding: '20px', borderRadius: '12px', border: '1px solid #4b5563', marginBottom: '15px', textAlign: 'center' },
  timerTitle: { margin: '0 0 10px 0', color: '#9ca3af', fontSize: '14px' },
  timerDisplay: { fontSize: '48px', fontWeight: 'bold', color: '#fcd34d', margin: '10px 0', fontFamily: 'monospace' },
  timerControls: { display: 'flex', justifyContent: 'center', gap: '10px' },
  timerBtn: { backgroundColor: '#4b5563', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  timerBtnSkip: { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  setsContainer: { marginTop: '10px', backgroundColor: '#1f2937', padding: '15px', borderRadius: '12px', border: '1px solid #374151' },
  setsTitle: { margin: '0 0 15px 0', fontSize: '16px', color: '#9ca3af' },
  setRow: { display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#374151', borderRadius: '8px', marginBottom: '8px', alignItems: 'center', gap: '10px' },
  setExerciseName: { color: '#60a5fa', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  setNumber: { color: '#9ca3af', fontSize: '12px' },
  setDetails: { color: 'white', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  checkIcon: { color: '#10b981', fontSize: '20px' },
  finishButton: { width: '100%', padding: '16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', marginTop: '20px' }
};

export default WorkoutLogger;