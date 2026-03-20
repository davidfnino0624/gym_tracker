import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Herramienta para cambiar de página mediante código

  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    
    console.log(`Intentando ${isLogin ? 'Ingresar' : 'Registrar'} con:`, email);
    
    // MOCK LOGIN: Como aún no hay backend, fingimos que el login fue exitoso 
    // y redirigimos al usuario a la zona privada de la app.
    alert("¡Login simulado exitoso! Entrando a la app...");
    navigate('/app'); 
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.submitBtn}>
          {isLogin ? 'Ingresar' : 'Registrarse'}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left' },
  input: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
  submitBtn: { padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  toggleBtn: { marginTop: '20px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }
};

export default Auth;