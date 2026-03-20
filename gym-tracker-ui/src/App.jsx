import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// 1. Importamos todas nuestras pantallas (Páginas)
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

// 2. Importamos nuestros componentes sueltos
import WorkoutLogger from './components/WorkoutLogger';

// 3. Componente Layout: Controla cuándo mostrar el menú superior
function Layout() {
  const location = useLocation();
  
  // Definimos cuáles son las rutas públicas donde NO queremos menú
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login';

  return (
    <div style={styles.appContainer}>
      
      {/* Menú de Navegación (Solo renderiza si NO es ruta pública) */}
      {!isPublicRoute && (
        <nav style={styles.navbar}>
          <Link to="/app" style={styles.link}>🏠 Inicio</Link>
          <Link to="/app/entrenar" style={styles.link}>💪 Entrenar</Link>
          <Link to="/app/dashboard" style={styles.link}>📈 Análisis</Link>
        </nav>
      )}

      {/* 4. El Enrutador: Cambia las pantallas mágicamente */}
      <Routes>
        {/* Mundo Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />

        {/* Mundo Privado */}
        <Route path="/app" element={<Home />} />
        <Route path="/app/entrenar" element={<WorkoutLogger />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
      </Routes>
      
    </div>
  );
}

// 5. Componente Principal: Envuelve todo en el Router
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

// Estilos globales de la App
const styles = {
  appContainer: { 
    maxWidth: '500px', 
    margin: '0 auto', 
    backgroundColor: '#f9fafb', 
    minHeight: '100vh',
    fontFamily: 'sans-serif'
  },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-around', 
    backgroundColor: '#1f2937', 
    padding: '15px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  link: { 
    color: 'white', 
    textDecoration: 'none', 
    fontWeight: 'bold', 
    fontSize: '16px' 
  }
};

export default App;