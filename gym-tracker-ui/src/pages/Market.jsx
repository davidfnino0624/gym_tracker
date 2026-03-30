import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Market() {
  const navigate = useNavigate();

  // 🧪 Catálogo de Productos (Próximamente vendrán de la base de datos)
  const [productos] = useState([
    { id: 1, name: 'Whey Protein Isolate', category: 'Proteínas', price: 54.99, image: 'https://images.unsplash.com/photo-1593095191312-9A47285b7367?q=80&w=300&auto=format&fit=crop', badge: 'Top Ventas', color: '#3b82f6' },
    { id: 2, name: 'Pre-Workout Catalyst', category: 'Pre-entrenos', price: 39.99, image: 'https://images.unsplash.com/photo-1610992015762-3023e4c4d284?q=80&w=300&auto=format&fit=crop', badge: 'Energía', color: '#a855f7' },
    { id: 3, name: 'Creatina Monohidratada', category: 'Proteínas', price: 29.99, image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=300&auto=format&fit=crop', badge: 'Fuerza', color: '#10b981' },
    { id: 4, name: 'Straps para Peso Muerto', category: 'Accesorios', price: 14.99, image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=300&auto=format&fit=crop', badge: '', color: '#f59e0b' },
    { id: 5, name: 'Cinturón de Levantamiento', category: 'Accesorios', price: 45.00, image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=300&auto=format&fit=crop', badge: 'Pro', color: '#ef4444' },
    { id: 6, name: 'BCAA + Electrolitos', category: 'Pre-entrenos', price: 24.99, image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=300&auto=format&fit=crop', badge: 'Recuperación', color: '#3b82f6' },
  ]);

  // Estados de la tienda
  const [categoriaActiva, setCategoriaActiva] = useState('Todo');
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Lógica del Carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, qty: 1 }]);
    }
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.qty, 0);

  // Filtro de categorías
  const categorias = ['Todo', 'Proteínas', 'Pre-entrenos', 'Accesorios'];
  const productosFiltrados = categoriaActiva === 'Todo' ? productos : productos.filter(p => p.category === categoriaActiva);

  const checkout = () => {
    if (carrito.length === 0) return alert("Tu carrito está vacío");
    alert(`¡Compra procesada por $${totalCarrito.toFixed(2)}! Te contactaremos para el envío.`);
    setCarrito([]);
    setIsCartOpen(false);
  };

  return (
    <div style={styles.container}>
      
      {/* 🛒 CABECERA DE LA TIENDA */}
      <header style={styles.header}>
        <div>
          <button onClick={() => navigate('/app')} style={styles.backBtn}>← Volver al Dashboard</button>
          <h2 style={styles.title}>Pro Shop ⚡</h2>
        </div>
        <button onClick={() => setIsCartOpen(true)} style={styles.cartBtn}>
          🛒 Carrito {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
        </button>
      </header>

      {/* 🎛️ FILTROS DE CATEGORÍA */}
      <div style={styles.filterContainer}>
        {categorias.map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategoriaActiva(cat)}
            style={{ ...styles.filterBtn, backgroundColor: categoriaActiva === cat ? '#3b82f6' : '#1f2937', color: categoriaActiva === cat ? 'white' : '#9ca3af' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📦 GRILLA DE PRODUCTOS */}
      <div style={styles.productGrid}>
        {productosFiltrados.map(prod => (
          <div key={prod.id} style={styles.productCard}>
            <div style={styles.imageContainer}>
              <img src={prod.image} alt={prod.name} style={styles.productImage} />
              {prod.badge && <span style={{ ...styles.badge, backgroundColor: prod.color }}>{prod.badge}</span>}
            </div>
            
            <div style={styles.productInfo}>
              <p style={styles.productCategory}>{prod.category}</p>
              <h3 style={styles.productName}>{prod.name}</h3>
              <div style={styles.productFooter}>
                <span style={styles.productPrice}>${prod.price.toFixed(2)}</span>
                <button onClick={() => agregarAlCarrito(prod)} style={styles.addBtn}>+ Añadir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🛍️ MODAL DEL CARRITO (Glassmorphism) */}
      {isCartOpen && (
        <div style={styles.cartOverlay}>
          <div style={styles.cartSidebar}>
            
            <div style={styles.cartHeader}>
              <h3 style={{ margin: 0, color: 'white' }}>Tu Pedido 🛒</h3>
              <button onClick={() => setIsCartOpen(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.cartBody}>
              {carrito.length === 0 ? (
                <p style={styles.emptyCart}>Tu carrito está pidiendo suplementos a gritos. 💪</p>
              ) : (
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
              )}
            </div>

            <div style={styles.cartFooter}>
              <div style={styles.totalRow}>
                <span>Total:</span>
                <span style={styles.totalPrice}>${totalCarrito.toFixed(2)}</span>
              </div>
              <button onClick={checkout} style={styles.checkoutBtn} disabled={carrito.length === 0}>
                💳 Proceder al Pago
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// 🎨 ESTILOS PRO E-COMMERCE
const styles = {
  container: { padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  backBtn: { background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '0 0 10px 0', fontSize: '14px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f8fafc' },
  cartBtn: { position: 'relative', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  cartBadge: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' },

  filterContainer: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '20px' },
  filterBtn: { padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color 0.3s' },

  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' },
  productCard: { backgroundColor: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' },
  imageContainer: { position: 'relative', height: '200px', backgroundColor: '#0f172a' },
  productImage: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 },
  badge: { position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' },
  productInfo: { padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' },
  productCategory: { fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px', margin: 0 },
  productName: { fontSize: '16px', color: '#f8fafc', margin: '0 0 15px 0', lineHeight: '1.4' },
  productFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  productPrice: { fontSize: '20px', fontWeight: 'bold', color: '#10b981' },
  addBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },

  // Estilos del Carrito (Glassmorphism Sidebar)
  cartOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' },
  cartSidebar: { width: '100%', maxWidth: '400px', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' },
  cartHeader: { padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' },
  cartBody: { flex: 1, overflowY: 'auto', padding: '20px' },
  emptyCart: { textAlign: 'center', color: '#64748b', marginTop: '50px' },
  cartItem: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1e293b', padding: '10px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #334155' },
  cartItemImg: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
  cartItemName: { margin: '0 0 5px 0', fontSize: '14px', color: '#e2e8f0', fontWeight: 'bold' },
  cartItemPrice: { margin: 0, fontSize: '13px', color: '#10b981' },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', fontSize: '16px', cursor: 'pointer' },
  cartFooter: { padding: '20px', borderTop: '1px solid #334155', backgroundColor: '#0f172a' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#f8fafc' },
  totalPrice: { color: '#10b981' },
  checkoutBtn: { width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Market;