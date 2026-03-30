import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// 1. Importamos todas nuestras pantallas (Páginas)
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// 🔥 IMPORTACIÓN NUEVA: Traemos la tienda
import Market from './pages/Market'; 

// 2. Importamos nuestros componentes sueltos
// (Ojo: Asegúrate de que WorkoutLogger siga en la carpeta /components)
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
          
          {/* 🔥 NUEVO ENLACE: Ahora la tienda está en el menú de arriba */}
          <Link to="/app/tienda" style={styles.link}>🛍️ Tienda</Link>
        </nav>
      )}

      {/* 4. El Enrutador: Cambia las pantallas mágicamente */}
      <Routes>
        {/* Mundo Público */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Mundo Privado */}
        <Route path="/app" element={<Home />} />
        <Route path="/app/entrenar" element={<WorkoutLogger />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        
        {/* 🔥 NUEVA RUTA: Le decimos a React qué mostrar cuando vayan a /app/tienda */}
        <Route path="/app/tienda" element={<Market />} />
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
    // 🔥 MEJORA: Quité el ancho máximo para que use toda la pantalla y puse el fondo Dark Mode
    margin: '0 auto', 
    backgroundColor: '#111827', 
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    color: 'white'
  },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-around', 
    backgroundColor: '#1f2937', 
    padding: '15px 0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)', // Sombra más pronunciada
    borderBottom: '1px solid #374151' // Bordecito sutil para separar el menú
  },
  link: { 
    color: '#f3f4f6', 
    textDecoration: 'none', 
    fontWeight: 'bold', 
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px' // Espacio entre el emoji y el texto
  }
};

export default App;