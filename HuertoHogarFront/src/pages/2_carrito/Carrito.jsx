import { useContext, useState } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

const Carrito = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useContext(CartContext);
  const { user, authHeader } = useContext(AuthContext);

  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  const formatPrice = (value) => `$${(value || 0).toLocaleString('es-CL')}`;

  const handleConfirm = async () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega productos antes de confirmar.');
      return;
    }
    if (!user) {
      alert('Debes iniciar sesión para confirmar tu pedido.');
      return;
    }

    setOrdering(true);
    setOrderError('');

    try {
      const body = {
        usuarioId: user.id,
        items: cart.map(item => ({ productoId: item.id, quantity: item.quantity })),
      };

      const res = await fetch('http://localhost:8082/api/v1/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setOrderError(err.message || 'Error al confirmar el pedido.');
        setOrdering(false);
        return;
      }

      const pedido = await res.json();
      clearCart();
      alert(`¡Pedido confirmado! Tu código es: ${pedido.codigo}. Puedes rastrearlo en "Seguimiento de Pedido".`);
    } catch {
      setOrderError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    }
    setOrdering(false);
  };

  return (
    <main className="container my-5 flex-grow-1">
        <h2 className="mb-4 text-center">Tu Carrito de Compras</h2>
        <div className="row">
             <div className="col-lg-8 mb-4">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Precio</th>
                                        <th>Cantidad</th>
                                        <th>Total</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                 <tbody>
                                    {cart.length === 0 ? (
                                      <tr>
                                          <td colSpan="5" className="text-center">El carrito está vacío.</td>
                                      </tr>
                                    ) : (
                                      cart.map(item => (
                                        <tr key={item.id}>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }} className="rounded" />
                                              <span>{item.name}</span>
                                            </div>
                                          </td>
                                          <td>{formatPrice(item.price)}</td>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                              <span className="mx-2">{item.quantity}</span>
                                              <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                          </td>
                                          <td>{formatPrice(item.price * item.quantity)}</td>
                                          <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                 </tbody>
                            </table>
                        </div>
                    </div>
                </div>
             </div>
        
        <div className="col-lg-4">
            <div className="card shadow-sm p-4">
                <h4 className="card-title mb-4">Resumen del pedido</h4>
                <div className="d-flex justify-content-between mb-3 text-secondary">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cartTotal)} CLP</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                    <strong>Total a pagar:</strong>
                    <strong className="fs-4 text-dark">{formatPrice(cartTotal)} CLP</strong>
                </div>
                {orderError && <div className="alert alert-danger">{orderError}</div>}
                <button onClick={handleConfirm} disabled={ordering} className="btn btn-primary w-100 btn-lg">
                  {ordering ? 'Confirmando...' : 'Confirmar Pedido'}
                </button>
            </div>
        </div>
        </div>
    </main>
  );
};

export default Carrito;
