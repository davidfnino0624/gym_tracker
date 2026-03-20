import { useState } from 'react';

function Dashboard() {
  // 1. El Estado que controla qué gráfica estamos viendo
  const [selectedChartExercise, setSelectedChartExercise] = useState('sentadilla');

  // 2. Datos Generales (Estos NO cambian con el dropdown)
  const generalStats = {
    totalWorkouts: 24,
    avgRestTime: "1m 45s",
    favoriteExercise: "Sentadilla"
  };

  // 3. Datos Simulados para las gráficas (Estos SÍ cambian)
  // Cuando conectemos Python, esta estructura vendrá de tu base de datos
  const mockChartData = {
    sentadilla: {
      volumeLabel: "Volumen Promedio: 2,500 kg",
      trendLabel: "Tendencia: Alcista ↗️",
      dataPoints: [95, 100, 102.5, 105, 107.5] // Simula los pesos para la gráfica
    },
    press_banca: {
      volumeLabel: "Volumen Promedio: 1,200 kg",
      trendLabel: "Tendencia: Estable ➡️",
      dataPoints: [60, 60, 62.5, 62.5, 65]
    }
  };

  // Extraemos la info del ejercicio seleccionado para inyectarla en los "placeholders"
  const currentChartData = mockChartData[selectedChartExercise];

  return (
    <div style={styles.container}>
      <h2>📈 Panel de Análisis</h2>
      
      {/* SECCIÓN 1: KPIs Generales */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <h3 style={styles.kpiTitle}>Entrenamientos</h3>
          <p style={styles.kpiValue}>{generalStats.totalWorkouts}</p>
        </div>
        <div style={styles.kpiCard}>
          <h3 style={styles.kpiTitle}>Descanso Promedio</h3>
          <p style={styles.kpiValue}>{generalStats.avgRestTime}</p>
        </div>
        <div style={styles.kpiCard}>
          <h3 style={styles.kpiTitle}>Top Ejercicio</h3>
          <p style={styles.kpiValue}>{generalStats.favoriteExercise}</p>
        </div>
      </div>

      <hr style={styles.divider} />

      {/* SECCIÓN 2: Análisis Específico con Dropdown */}
      <div style={styles.chartSectionHeader}>
        <h3>Análisis por Ejercicio</h3>
        <select 
          value={selectedChartExercise} 
          onChange={(e) => setSelectedChartExercise(e.target.value)}
          style={styles.dropdown}
        >
          <option value="sentadilla">Sentadilla</option>
          <option value="press_banca">Press de Banca</option>
        </select>
      </div>

      {/* Los Contenedores de las Gráficas (Ahora dinámicos) */}
      <div style={styles.chartsContainer}>
        <div style={styles.chartBox}>
          <div style={styles.chartHeader}>
            <h4>Tendencia de Fuerza (1RM)</h4>
            <span style={styles.badge}>{currentChartData.trendLabel}</span>
          </div>
          <div style={styles.placeholder}>
            📊 [Gráfica renderizando datos: {currentChartData.dataPoints.join(', ')} kg]
          </div>
        </div>

        <div style={styles.chartBox}>
          <div style={styles.chartHeader}>
            <h4>Volumen Total por Sesión</h4>
            <span style={styles.badge}>{currentChartData.volumeLabel}</span>
          </div>
          <div style={styles.placeholder}>
            📉 [Gráfica de barras del volumen]
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' },
  kpiGrid: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: '120px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #3b82f6' },
  kpiTitle: { fontSize: '14px', color: '#666', margin: '0 0 5px 0' },
  kpiValue: { fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#1f2937' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' },
  chartSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  dropdown: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minWidth: '200px' },
  chartsContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  chartBox: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  badge: { backgroundColor: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  placeholder: { height: '200px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#64748b', fontStyle: 'italic', border: '1px dashed #cbd5e1' }
};

export default Dashboard;