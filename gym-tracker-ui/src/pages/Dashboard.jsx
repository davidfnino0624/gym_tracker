import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Analysis() {
  const navigate = useNavigate();
  const [ejercicios, setEjercicios] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper para los headers de seguridad
  const getAuthHeaders = () => {
    const token = localStorage.getItem('gym_token');
    if (!token) { navigate('/login'); return null; }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    fetch('http://localhost:8000/ejercicios')
      .then(res => res.json())
      .then(data => {
        setEjercicios(data);
        if (data.length > 0) setSelectedExercise(data[0].name);
      }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      const headers = getAuthHeaders();
      if (!headers) return; // Si no hay token, se cancela

      setLoading(true);
      fetch(`http://localhost:8000/analisis/progreso-ejercicio?nombre=${encodeURIComponent(selectedExercise)}`, { headers })
        .then(res => {
          if (res.status === 401) throw new Error("No autorizado");
          return res.json();
        })
        .then(data => { setHistory(data); setLoading(false); })
        .catch(err => {
          console.error(err);
          setLoading(false);
          if (err.message === "No autorizado") navigate('/login');
        });
    }
  }, [selectedExercise, navigate]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Análisis de Fuerza 📈</h2>

      <div style={styles.selectorCard}>
        <label style={styles.label}>Selecciona un ejercicio para ver tu progreso:</label>
        <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} style={styles.select}>
          {ejercicios.map((ej) => (<option key={ej.exercise_id} value={ej.name}>{ej.name}</option>))}
        </select>
      </div>

      <section style={styles.card}>
        <h3 style={styles.cardTitle}>Evolución de Carga Máxima (kg)</h3>
        {loading ? ( <p style={styles.infoText}>Cargando datos...</p> ) : history.length > 0 ? (
          <div style={styles.chartContainer}>
            {history.map((d, i) => (
              <div key={i} style={styles.barGroup}>
                <div style={styles.barValue}>{Math.round(d.max_weight)}</div>
                <div style={{ ...styles.bar, height: `${Math.min(150, d.max_weight * 1.5)}px`, backgroundColor: i === history.length - 1 ? '#10b981' : '#3b82f6' }}></div>
                <div style={styles.barDate}>{d.fecha}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>Aún no tienes registros para este ejercicio.</p>
            <p style={{fontSize: '12px', color: '#6b7280'}}>¡Ve a entrenar para ver tu gráfica!</p>
          </div>
        )}
      </section>

      {history.length >= 2 && (
        <div style={styles.tipCard}>
          <p style={{margin: 0}}>
            🚀 Tu mejor levantamiento fue de <strong>{Math.max(...history.map(h => h.max_weight))} kg</strong>. 
            {history[history.length-1].max_weight >= history[history.length-2].max_weight ? " ¡Vas subiendo, sigue así!" : " Hoy fue un día de descarga, ¡mañana con toda!"}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px 15px', backgroundColor: '#111827', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' },
  title: { marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' },
  selectorCard: { backgroundColor: '#1f2937', padding: '15px', borderRadius: '12px', border: '1px solid #374151', marginBottom: '15px' },
  label: { display: 'block', color: '#9ca3af', fontSize: '13px', marginBottom: '10px' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: '1px solid #4b5563', fontSize: '16px' },
  card: { backgroundColor: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid #374151', minHeight: '250px' },
  cardTitle: { margin: '0 0 30px 0', fontSize: '15px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' },
  chartContainer: { display: 'flex', alignItems: 'flex-end', gap: '20px', height: '180px', overflowX: 'auto', paddingBottom: '10px' },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
  barValue: { fontSize: '12px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '5px' },
  bar: { width: '35px', borderRadius: '6px 6px 0 0', transition: 'all 0.3s ease' },
  barDate: { fontSize: '11px', color: '#6b7280', marginTop: '10px' },
  emptyState: { textAlign: 'center', paddingTop: '40px', color: '#4b5563' },
  infoText: { textAlign: 'center', color: '#9ca3af' },
  tipCard: { marginTop: '20px', padding: '15px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', fontSize: '14px' }
};

export default Analysis;