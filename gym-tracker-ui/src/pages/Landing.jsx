import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  // 🧪 Catálogo
  const [productos] = useState([
    { id: 1, name: 'Whey Protein Isolate - Vanilla', category: 'Proteínas', price: 54.99, image: 'https://images.unsplash.com/photo-1593095191312-9A47285b7367?q=80&w=300&auto=format&fit=crop', accent: '#3b82f6' },
    { id: 2, name: 'Pre-Workout - Fruit Punch', category: 'Pre-entrenos', price: 39.99, image: 'https://images.unsplash.com/photo-1610992015762-3023e4c4d284?q=80&w=300&auto=format&fit=crop', accent: '#a855f7' },
    { id: 3, name: 'Vendas de Muñeca', category: 'Accesorios', price: 19.99, image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=300&auto=format&fit=crop', accent: '#10b981' },
    { id: 4, name: 'Creatina Monohidratada', category: 'Proteínas', price: 29.99, image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=300&auto=format&fit=crop', accent: '#3b82f6' },
  ]);

  // Estados del Carrito y Buscador
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false); // Controla si mostramos los productos o el formulario
  const [busqueda, setBusqueda] = useState('');

  // Lógica del Carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, qty: 1 }]);
    }
    setIsCartOpen(true); // Abre el carrito automáticamente para que vea que se agregó
  };

  const quitarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id !== id));
  
  const totalCarrito = carrito.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.qty, 0);

  // Procesar Compra sin registro
  const handleFinalizarCompra = (e) => {
    e.preventDefault();
    alert(`¡Pedido confirmado por $${totalCarrito.toFixed(2)}! Te enviaremos la guía de envío a tu correo. 🚀`);
    setCarrito([]);
    setIsCheckout(false);
    setIsCartOpen(false);
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* 🚀 BARRA DE NAVEGACIÓN (Estilo Suplementos Colombia) */}
      <nav style={styles.publicNavbar}>
        <div style={styles.navContainer}>
          
          {/* Logo */}
          <div style={styles.logoContainer}>
            <span style={styles.logoText}>GYM TRACKER <span style={{color: '#3b82f6'}}>PRO</span></span>
          </div>

          {/* Buscador Central */}
          <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="¿Qué estás buscando?" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
            <button style={styles.searchBtn}>🔍</button>
          </div>

          {/* Links y Carrito */}
          <div style={styles.navActions}>
            <Link to="/login" style={styles.navLink}>INICIAR SESIÓN</Link>
            
            <button onClick={() => setIsCartOpen(true)} style={styles.cartButton}>
              🛒 <span style={{marginLeft: '8px'}}>{totalItems} - ${totalCarrito.toFixed(0)}</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 🦍 SECCIÓN DE PRODUCTOS (La Vitrina) */}
      <section style={styles.productsSection}>
        <div style={styles.heroBanner}>
          <h1 style={styles.heroTitle}>POTENCIA TUS <span style={{color: '#3b82f6'}}>MARCAS</span></h1>
          <p style={styles.heroSub}>Suplementos élite sin intermediarios. Pide hoy, entrena mañana.</p>
        </div>

        <div style={styles.productGrid}>
          {productos.map((product) => (
            <div key={product.id} style={{ ...styles.productCard, borderColor: product.accent }}>
              <img src={product.image} alt={product.name} style={styles.productImage} />
              <div style={styles.productInfo}>
                <p style={{fontSize: '12px', color: '#9ca3af', margin: '0 0 5px 0', textTransform: 'uppercase'}}>{product.category}</p>
                <h4 style={styles.productName}>{product.name}</h4>
                <div style={styles.productFooter}>
                  <span style={{ ...styles.productPrice, color: product.accent }}>${product.price}</span>
                  <button onClick={() => agregarAlCarrito(product)} style={{ ...styles.buyBtn, backgroundColor: product.accent }}>
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🛍️ MODAL DEL CARRITO Y CHECKOUT */}
      {isCartOpen && (
        <div style={styles.cartOverlay}>
          <div style={styles.cartSidebar}>
            
            <div style={styles.cartHeader}>
              <h3 style={{ margin: 0, color: 'white' }}>{isCheckout ? 'Datos de Envío 📦' : 'Tu Carrito 🛒'}</h3>
              <button onClick={() => { setIsCartOpen(false); setIsCheckout(false); }} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.cartBody}>
              {carrito.length === 0 ? (
                <p style={styles.emptyCart}>Tu carrito está vacío. ¡Añade suplementos!</p>
              ) : !isCheckout ? (
                // VISTA 1: Lista de productos en el carrito
                carrito.map(item => (
                  <div key={item.id} style={styles.cartItem}>
                    <img src={item.image} alt={item.name} style={styles.cartItemImg} />
                    <div style={{ flex: 1 }}>
                      <p style={styles.cartItemName}>{item.name}</p>
                      <p style={styles.cartItemPrice}>${item.price} x {item.qty}</p>
                    </div>
                    <button onClick={() => quitarDelCarrito(item.id)} style={styles.removeBtn}>🗑️</button>
                  </div>
                ))
              ) : (
                // VISTA 2: Formulario de Compra (Sin Registro)
                <form id="checkout-form" onSubmit={handleFinalizarCompra} style={styles.checkoutForm}>
                  <p style={{fontSize: '14px', color: '#9ca3af', marginBottom: '15px'}}>Por favor llena tus datos para procesar el envío.</p>
                  
                  <label style={styles.label}>Nombre Completo</label>
                  <input type="text" required style={styles.input} placeholder="Ej. David Niño" />

                  <label style={styles.label}>Correo (Para enviarte la guía)</label>
                  <input type="email" required style={styles.input} placeholder="david@email.com" />

                  <label style={styles.label}>Dirección de Entrega</label>
                  <input type="text" required style={styles.input} placeholder="Calle 123 # 45-67, Apto 2" />

                  <div style={{display: 'flex', gap: '10px'}}>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Ciudad</label>
                      <input type="text" required style={styles.input} placeholder="Bogotá" />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={styles.label}>Teléfono</label>
                      <input type="tel" required style={styles.input} placeholder="300 123 4567" />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div style={styles.cartFooter}>
              <div style={styles.totalRow}>
                <span>Total a Pagar:</span>
                <span style={{ color: '#10b981' }}>${totalCarrito.toFixed(2)}</span>
              </div>
              
              {carrito.length > 0 && (
                !isCheckout ? (
                  <button onClick={() => setIsCheckout(true)} style={styles.checkoutBtn}>Proceder al Pago</button>
                ) : (
                  <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => setIsCheckout(false)} style={styles.backCartBtn}>Atrás</button>
                    <button type="submit" form="checkout-form" style={styles.checkoutBtn}>Confirmar Pedido</button>
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// 🎨 ESTILOS
const styles = {
  pageContainer: { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' },
  
  // 🔥 ESTILOS DE LA BARRA DE NAVEGACIÓN (Como Suplementos Colombia)
  publicNavbar: { backgroundColor: '#000000', padding: '15px 0', borderBottom: '1px solid #1f2937', position: 'sticky', top: 0, zIndex: 50 },
  navContainer: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', flexWrap: 'wrap', gap: '15px' },
  logoText: { fontSize: '24px', fontWeight: '900', letterSpacing: '1px', color: 'white' },
  
  searchContainer: { display: 'flex', flex: '1 1 300px', maxWidth: '500px', margin: '0 20px' },
  searchInput: { flex: 1, padding: '10px 15px', borderRadius: '20px 0 0 20px', border: 'none', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', outline: 'none' },
  searchBtn: { padding: '10px 20px', borderRadius: '0 20px 20px 0', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' },
  
  navActions: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' },
  cartButton: { backgroundColor: '#1f2937', border: '1px solid #374151', color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center' },

  // Estilos de la Vitrina
  productsSection: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
  heroBanner: { textAlign: 'center', marginBottom: '40px', padding: '40px', backgroundColor: '#1e293b', borderRadius: '16px', backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroTitle: { fontSize: 'clamp(28px, 5vw, 48px)', margin: '0 0 10px 0', fontWeight: '900' },
  heroSub: { fontSize: '16px', color: '#cbd5e1', margin: 0 },
  
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' },
  productCard: { backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  productImage: { width: '100%', height: '220px', objectFit: 'cover' },
  productInfo: { padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 },
  productName: { margin: '0 0 15px 0', fontSize: '16px', color: '#f8fafc', flex: 1 },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: '20px', fontWeight: 'bold' },
  buyBtn: { padding: '10px 15px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },

  // Estilos del Carrito / Modal Checkout
  cartOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' },
  cartSidebar: { width: '100%', maxWidth: '400px', height: '100%', backgroundColor: '#0f172a', borderLeft: '1px solid #1f2937', display: 'flex', flexDirection: 'column' },
  cartHeader: { padding: '20px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer' },
  cartBody: { flex: 1, overflowY: 'auto', padding: '20px' },
  emptyCart: { textAlign: 'center', color: '#64748b', marginTop: '40px' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', marginBottom: '10px' },
  cartItemImg: { width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' },
  cartItemName: { margin: '0 0 5px 0', fontSize: '14px', color: 'white', fontWeight: 'bold' },
  cartItemPrice: { margin: 0, fontSize: '13px', color: '#10b981' },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' },
  
  // Checkout Form Styles
  checkoutForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '-5px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', fontSize: '14px', boxSizing: 'border-box' },

  cartFooter: { padding: '20px', borderTop: '1px solid #1f2937', backgroundColor: '#020617' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' },
  checkoutBtn: { flex: 2, padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  backCartBtn: { flex: 1, padding: '15px', backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Landing;