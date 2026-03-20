import { useState } from 'react';
import RestTimer from './RestTimer';

function WorkoutLogger() {
  // 1. Definición de Estados (Las variables que controlan la pantalla)
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [unit, setUnit] = useState('lbs');
  const [isResting, setIsResting] = useState(false); // Controla si mostramos el form o el timer

  // 2. Lógica de Negocio
  const handleCompleteSet = () => {
    // Prevención de errores (Poka-yoke)
    if (weight <= 0) {
      alert("¡Ey! Añade algo de peso antes de guardar la serie.");
      return; 
    }

    // Estructuramos los datos que luego enviaremos a nuestra base de datos en PostgreSQL
    const setData = {
    reps: reps,
    input_weight: weight,
    weight_unit: unit,
    // ¡Aquí añadimos la métrica estandarizada que SQL espera!
    standardized_weight_kg: unit === 'lbs' ? weight * 0.453592 : weight
    };

    console.log("Serie lista para enviar al backend:", setData);
    setIsResting(true); // Cambiamos la vista al modo descanso
  };

  const toggleUnit = () => {
    setUnit(unit === 'lbs' ? 'kg' : 'lbs');
  };

  // 3. Vista de Descanso
if (isResting) {
  return (
    <RestTimer 
      initialTime={90} // Minuto y medio por defecto
      onSkip={() => setIsResting(false)} 
    />
  );
}

  // 4. Vista Principal del Gimnasio
  return (
    <div style={styles.card}>
      <h2 style={{ textAlign: 'center' }}>Sentadilla (Ejemplo)</h2>

      {/* Control de Repeticiones */}
      <div style={styles.controlGroup}>
        <label>Repeticiones</label>
        <div style={styles.row}>
          <button onClick={() => setReps(reps > 1 ? reps - 1 : 1)} style={styles.circleBtn}>-</button>
          <span style={styles.bigNumber}>{reps}</span>
          <button onClick={() => setReps(reps + 1)} style={styles.circleBtn}>+</button>
        </div>
      </div>

      {/* Control de Peso y Unidad */}
      <div style={styles.controlGroup}>
        <label>Peso a levantar</label>
        <div style={styles.row}>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            style={styles.input}
          />
          <button onClick={toggleUnit} style={styles.toggleBtn}>
            {unit.toUpperCase()} 🔄
          </button>
        </div>
      </div>

      {/* Botón de Acción Principal */}
      <button onClick={handleCompleteSet} style={styles.mainButton}>
        Completar Serie y Descansar
      </button>
    </div>
  );
}

// Estilos rápidos para que sea funcional desde el día 1
const styles = {
  card: { maxWidth: '350px', margin: '20px auto', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' },
  controlGroup: { margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '10px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  circleBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#ddd', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' },
  bigNumber: { fontSize: '28px', fontWeight: 'bold' },
  input: { width: '80px', fontSize: '24px', textAlign: 'center', padding: '5px', borderRadius: '8px', border: '1px solid #ccc' },
  toggleBtn: { padding: '10px 15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  mainButton: { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '10px', marginTop: '10px', cursor: 'pointer' }
};

export default WorkoutLogger;