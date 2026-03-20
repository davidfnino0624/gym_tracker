import { useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [bodyWeight, setBodyWeight] = useState(75.5);
  const [targetExercise, setTargetExercise] = useState('sentadilla');
  const [selectedRoutine, setSelectedRoutine] = useState(''); // Estado para la rutina seleccionada

  // Simulamos las rutinas que vendrán de tu base de datos
  const mockRoutines = [
    { id: '1', name: '🔥 Día de Pierna Pesado' },
    { id: '2', name: '💪 Empuje (Pecho/Tríceps)' },
    { id: '3', name: '🦍 Tirón (Espalda/Bíceps)' }
  ];

  const lastWorkoutData = {
    sentadilla: { date: 'Hace 3 días', weight: 100, reps: 5, sets: 4 },
    press_banca: { date: 'Hace 5 días', weight: 62.5, reps: 8, sets: 3 }
  };

  const currentTarget = lastWorkoutData[targetExercise];

  return (
    <div style={styles.container}>
      
      {/* SECCIÓN 1: Perfil */}
      <section style={styles.card}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>👤</div>
          <div>
            <h2 style={{ margin: 0 }}>¡A romperla hoy!</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Peso corporal:</span>
              <input 
                type="number" 
                value={bodyWeight} 
                onChange={(e) => setBodyWeight(e.target.value)}
                style={styles.weightInput}
              />
              <span style={{ color: '#666', fontSize: '14px' }}>kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Acciones Rápidas (AHORA CON SELECTOR DE RUTINAS) */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Tu Sesión</h3>
        <div style={styles.actionGrid}>
          
          <Link to="/app/entrenar" style={styles.primaryAction}>
            ⚡ Iniciar Entrenamiento Libre
          </Link>
          
          <div style={styles.routineSelectorContainer}>
            <select 
              value={selectedRoutine} 
              onChange={(e) => setSelectedRoutine(e.target.value)}
              style={styles.routineDropdown}
            >
              <option value="" disabled>Selecciona una rutina guardada...</option>
              {mockRoutines.map(routine => (
                <option key={routine.id} value={routine.id}>{routine.name}</option>
              ))}
            </select>
            
            <button 
              style={{
                ...styles.startRoutineBtn, 
                backgroundColor: selectedRoutine ? '#10b981' : '#d1d5db',
                cursor: selectedRoutine ? 'pointer' : 'not-allowed'
              }}
              disabled={!selectedRoutine}
            >
              🏋️ Empezar Rutina
            </button>
          </div>

          <button style={styles.secondaryAction}>📋 Crear Nueva Rutina</button>
        </div>
      </section>

      {/* SECCIÓN 3: Meta del Día */}
      <section style={styles.highlightCard}>
        <h3 style={{ ...styles.sectionTitle, color: 'white' }}>🎯 Tu marca a vencer</h3>
        <select 
          value={targetExercise} 
          onChange={(e) => setTargetExercise(e.target.value)}
          style={styles.dropdownDark}
        >
          <option value="sentadilla">Sentadilla</option>
          <option value="press_banca">Press de Banca</option>
        </select>

        {currentTarget ? (
          <div style={styles.targetInfo}>
            <p style={styles.lastDate}>Última vez: {currentTarget.date}</p>
            <div style={styles.targetNumbers}>
              <span style={styles.bigNumber}>{currentTarget.weight} <small>kg</small></span>
              <span style={styles.multiplier}>×</span>
              <span style={styles.bigNumber}>{currentTarget.reps} <small>reps</small></span>
            </div>
            <p style={styles.targetSets}>Completaste {currentTarget.sets} series.</p>
            <div style={styles.motivationBanner}>
              ¡Intenta subirle 2.5 kg o sacar 1 rep extra hoy! 🔥
            </div>
          </div>
        ) : (
          <p style={{ color: 'white' }}>No hay registros previos.</p>
        )}
      </section>

    </div>
  );
}

// Estilos actualizados con las nuevas clases
const styles = {
  container: { padding: '15px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' },
  highlightCard: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '20px', color: 'white' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatar: { fontSize: '40px', backgroundColor: '#f3f4f6', borderRadius: '50%', padding: '10px' },
  weightInput: { width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' },
  sectionTitle: { margin: '0 0 15px 0', fontSize: '18px' },
  actionGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  primaryAction: { padding: '15px', backgroundColor: '#3b82f6', color: 'white', textAlign: 'center', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' },
  
  // Nuevos estilos para el selector de rutinas
  routineSelectorContainer: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' },
  routineDropdown: { padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px', width: '100%', backgroundColor: 'white' },
  startRoutineBtn: { padding: '12px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px' },
  
  secondaryAction: { padding: '12px', backgroundColor: 'transparent', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' },
  dropdownDark: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', marginBottom: '15px', fontSize: '16px', backgroundColor: '#374151', color: 'white', fontWeight: 'bold' },
  targetInfo: { textAlign: 'center', marginTop: '10px' },
  lastDate: { color: '#9ca3af', fontSize: '14px', margin: '0 0 10px 0' },
  targetNumbers: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  bigNumber: { fontSize: '32px', fontWeight: '900', color: '#10b981' },
  multiplier: { fontSize: '24px', color: '#6b7280' },
  targetSets: { color: '#d1d5db', margin: '0 0 15px 0' },
  motivationBanner: { backgroundColor: '#374151', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: '#fcd34d' }
};

export default Home;