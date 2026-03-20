import { useState, useEffect } from 'react';

// Recibimos 'initialTime' (segundos) y 'onSkip' (función para volver al form) como "props"
function RestTimer({ initialTime = 90, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // useEffect es el motor del temporizador. Se ejecuta cuando el componente aparece.
  useEffect(() => {
    // Si el tiempo llega a 0, ejecutamos la función para volver a la pantalla de la serie
    if (timeLeft <= 0) {
      onSkip();
      return;
    }

    // Creamos un intervalo que resta 1 cada 1000 milisegundos (1 segundo)
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // PRO-TIP: La función de limpieza (Cleanup). 
    // Si el usuario presiona "Saltar", React destruye este componente. 
    // Esta línea asegura que el intervalo se detenga y no consuma memoria en el fondo.
    return () => clearInterval(intervalId);
  }, [timeLeft, onSkip]);

  // Funciones de conveniencia para el gym
  const addTime = () => setTimeLeft((prev) => prev + 30);
  const subtractTime = () => setTimeLeft((prev) => (prev > 10 ? prev - 10 : 0));

  // Formatear segundos a MM:SS (Ej: 90 -> 01:30)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div style={styles.timerCard}>
      <h3 style={styles.title}>Descanso</h3>
      
      <div style={styles.timeDisplay}>
        {displayTime}
      </div>

      <div style={styles.controls}>
        <button onClick={subtractTime} style={styles.adjustBtn}>-10s</button>
        <button onClick={addTime} style={styles.adjustBtn}>+30s</button>
      </div>

      <button onClick={onSkip} style={styles.skipButton}>
        ¡Listo, a darle! (Saltar)
      </button>
    </div>
  );
}

const styles = {
  timerCard: { maxWidth: '350px', margin: '20px auto', padding: '30px 20px', borderRadius: '15px', backgroundColor: '#1e1e1e', color: 'white', textAlign: 'center', fontFamily: 'sans-serif', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
  title: { margin: '0 0 20px 0', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' },
  timeDisplay: { fontSize: '64px', fontWeight: 'bold', margin: '20px 0', fontFamily: 'monospace', color: '#4ade80' },
  controls: { display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' },
  adjustBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#333', color: 'white', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  skipButton: { width: '100%', padding: '15px', backgroundColor: '#ef4444', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer' }
};

export default RestTimer;