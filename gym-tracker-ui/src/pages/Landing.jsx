import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={styles.container}>
      {/* Sección Hero (El gancho principal) */}
      <header style={styles.hero}>
        <h1>Domina tu Progreso en el Gym 🏋️‍♂️</h1>
        <p>Deja el Excel atrás. Trackea tus pesos, descansos y calcula tu 1RM en tiempo real.</p>
        <Link to="/login" style={styles.ctaButton}>Comenzar a Entrenar Gratis</Link>
      </header>

      {/* Sección de Negocio (Tus futuros suplementos) */}
      <section style={styles.storeSection}>
        <h2>Potencia tus Resultados (Próximamente)</h2>
        <p>Nuestra línea exclusiva de suplementos estará disponible muy pronto.</p>
        
        <div style={styles.productGrid}>
          {/* Tarjetas de productos de ejemplo */}
          <div style={styles.productCard}>
            <h3>Proteína Whey</h3>
            <p>Construye músculo limpio.</p>
            <button disabled>Próximamente</button>
          </div>
          <div style={styles.productCard}>
            <h3>Pre-Entreno</h3>
            <p>Energía para romper récords.</p>
            <button disabled>Próximamente</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' },
  hero: { padding: '50px 20px', backgroundColor: '#1f2937', color: 'white', borderRadius: '10px', marginBottom: '30px' },
  ctaButton: { display: 'inline-block', padding: '15px 30px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '20px' },
  storeSection: { padding: '20px', borderTop: '2px solid #eee' },
  productGrid: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '20px' },
  productCard: { border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '200px' }
};

export default Landing;