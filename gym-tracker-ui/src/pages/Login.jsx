import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  
  // Estados para manejar el formulario
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Decidimos a qué ruta enviar los datos dependiendo de si está en modo Login o Registro
    const endpoint = isLogin ? 'http://localhost:8000/login' : 'http://localhost:8000/registro';
    
    // Si es registro, enviamos un username temporal basado en el email
    const payload = isLogin 
      ? { email, password } 
      : { email, password, username: email.split('@')[0] };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Guardamos la manilla VIP (Token) en el navegador
          localStorage.setItem('gym_token', data.access_token);
          alert(data.mensaje);
          navigate('/app'); 
        } else {
          alert("¡Cuenta creada! Ahora inicia sesión.");
          setIsLogin(true); // Lo pasamos a la vista de Login
          setPassword(''); // Limpiamos la clave por seguridad
        }
      } else {
        alert("Error: " + data.detail);
      }
    } catch (error) {
      console.error("Error conectando con el servidor:", error);
      alert("Error de conexión al servidor.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* Luces de neón de fondo para el efecto "Gamer" */}
      <div style={styles.neonGlowBlue}></div>
      <div style={styles.neonGlowPurple}></div>

      {/* Tarjeta de Cristal (Glassmorphism) */}
      <div style={styles.glassCard}>
        
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLogin ? 'BIENVENIDO DE VUELTA' : 'ÚNETE A LA REVOLUCIÓN'}
          </h2>
          <p style={styles.subtitle}>
            {isLogin ? 'Tus marcas te están esperando.' : 'Crea tu cuenta y empieza a mutar.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              placeholder="atleta@gym.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordContainer}>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputPassword}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>
            {isLogin ? 'INGRESAR' : 'CREAR CUENTA'}
          </button>
        </form>

        {/* Toggle entre Login y Registro */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya eres un atleta pro?'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              style={styles.toggleBtn}
            >
              {isLogin ? ' Regístrate aquí' : ' Inicia sesión'}
            </button>
          </p>
          <Link to="/" style={styles.backLink}>← Volver al inicio</Link>
        </div>

      </div>
    </div>
  );
}

// 🎨 ESTILOS "PRO" (Dark Mode + Glassmorphism + Neón)
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#0f172a', // Azul ultra oscuro
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'sans-serif'
  },
  
  // Efectos de luces de fondo (Glow)
  neonGlowBlue: {
    position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px',
    backgroundColor: 'rgba(59, 130, 246, 0.3)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
  },
  neonGlowPurple: {
    position: 'absolute', bottom: '10%', right: '20%', width: '300px', height: '300px',
    backgroundColor: 'rgba(168, 85, 247, 0.2)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0
  },

  // Tarjeta principal (Glassmorphism)
  glassCard: {
    width: '100%', maxWidth: '420px', padding: '40px', zIndex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // Fondo semitransparente
    backdropFilter: 'blur(16px)', // El truco del cristal
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },

  header: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900', color: '#f8fafc', letterSpacing: '1px' },
  subtitle: { margin: 0, fontSize: '14px', color: '#94a3b8' },

  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  
  input: {
    width: '100%', padding: '14px', borderRadius: '10px', boxSizing: 'border-box',
    backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#f8fafc', fontSize: '15px',
    border: '1px solid #334155', outline: 'none', transition: 'border-color 0.3s'
  },
  
  passwordContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputPassword: {
    width: '100%', padding: '14px', borderRadius: '10px', boxSizing: 'border-box',
    backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#f8fafc', fontSize: '15px',
    border: '1px solid #334155', outline: 'none', transition: 'border-color 0.3s', paddingRight: '45px'
  },
  eyeButton: {
    position: 'absolute', right: '10px', background: 'none', border: 'none',
    fontSize: '18px', cursor: 'pointer', padding: '5px', color: '#94a3b8'
  },

  submitBtn: {
    width: '100%', padding: '16px', marginTop: '10px', borderRadius: '10px',
    backgroundColor: '#3b82f6', color: '#ffffff', border: 'none',
    fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer',
    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)', transition: 'transform 0.2s, backgroundColor 0.2s'
  },

  footer: { marginTop: '30px', textAlign: 'center' },
  footerText: { color: '#94a3b8', fontSize: '14px', margin: '0 0 15px 0' },
  toggleBtn: { background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', padding: 0 },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: '13px', transition: 'color 0.3s' }
};

export default Login;