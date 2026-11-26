import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ProductContext } from '../../context/ProductContext';
import { Navigate } from 'react-router-dom';

const ESTADOS_PEDIDO = ['Pedido Confirmado', 'En Preparación', 'En Camino', 'Entregado'];

const Admin = () => {
  const { user, authHeader } = useContext(AuthContext);
  const { products, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);

  const [activeTab, setActiveTab] = useState('productos');
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', categoria: 'frutas', price: '', stock: '', unidad: '', image: '/assets/img/logo.png'
  });

  const isAdmin = user?.role === 'admin';
  const isVendedor = user?.role === 'vendedor';

  useEffect(() => {
    if (activeTab === 'ordenes' && (isAdmin || isVendedor)) {
      setLoadingPedidos(true);
      fetch('http://localhost:8082/api/v1/pedidos', {
        headers: { ...authHeader() }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setPedidos(Array.isArray(data) ? data : []);
          setLoadingPedidos(false);
        })
        .catch(() => {
          setPedidos([]);
          setLoadingPedidos(false);
        });
    }
  }, [activeTab, isAdmin, isVendedor, authHeader]);

  if (!user || (!isAdmin && !isVendedor)) {
    return <Navigate to="/" replace />;
  }

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({ ...product, nombre: product.name || product.nombre || '' });
    setShowEditModal(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addProduct({
      codigo: formData.codigo,
      name: formData.nombre,
      categoria: formData.categoria,
      price: Number(formData.price),
      stock: Number(formData.stock),
      unidad: formData.unidad,
      image: formData.image
    });
    setShowAddModal(false);
    setFormData({ codigo: '', nombre: '', categoria: 'frutas', price: '', stock: '', unidad: '', image: '/assets/img/logo.png' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProduct(selectedProduct.id, {
      ...selectedProduct,
      name: formData.nombre,
      price: Number(formData.price)
    });
    setShowEditModal(false);
  };

  const confirmDelete = () => {
    deleteProduct(selectedProduct.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold fs-4 mb-0" style={{ fontFamily: "'Playfair Display', serif", color: "#198754" }}>
            {isAdmin ? 'Panel de Administración' : 'Panel de Vendedor'}
          </h2>
          <p className="text-muted small mb-0">
            {isAdmin
              ? 'Administra el inventario, catálogo y órdenes de HuertoHogar'
              : 'Visualiza el catálogo de productos y el detalle de órdenes'}
          </p>
        </div>
        {isAdmin && activeTab === 'productos' && (
          <button className="btn btn-success btn-sm shadow-sm rounded-pill px-3 fw-bold" onClick={() => setShowAddModal(true)}>
            + Nuevo Producto
          </button>
        )}
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'productos' ? 'active fw-bold text-success' : 'text-muted'}`}
            onClick={() => setActiveTab('productos')}
          >
            Productos ({products.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ordenes' ? 'active fw-bold text-success' : 'text-muted'}`}
            onClick={() => setActiveTab('ordenes')}
          >
            Órdenes / Pedidos
          </button>
        </li>
      </ul>

      {activeTab === 'productos' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: "0.9rem" }}>
                <thead className="bg-success text-white">
                  <tr>
                    <th className="ps-3 rounded-top-left py-2">Cod.</th>
                    <th className="py-2">Imagen</th>
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Categoría</th>
                    <th className="py-2">Precio</th>
                    <th className="py-2">Stock</th>
                    {isAdmin && <th className="text-center rounded-top-right py-2">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="ps-3 fw-bold text-secondary">{p.codigo || p.id}</td>
                      <td>
                        <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="rounded" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                      </td>
                      <td className="fw-semibold">{p.name}</td>
                      <td><span className="badge bg-light text-dark border">{p.categoria || 'N/A'}</span></td>
                      <td className="text-success fw-bold">${p.price?.toLocaleString('es-CL')}</td>
                      <td>{p.stock || 0} {p.unidad || 'u'}</td>
                      {isAdmin && (
                        <td className="text-center">
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleOpenEdit(p)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleOpenDelete(p)}>Eliminar</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ordenes' && (
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-0">
            {loadingPedidos ? (
              <div className="p-4 text-center text-muted">Cargando órdenes...</div>
            ) : pedidos.length === 0 ? (
              <div className="p-4 text-center text-muted">No hay órdenes registradas.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-sm align-middle mb-0" style={{ fontSize: "0.9rem" }}>
                  <thead className="bg-success text-white">
                    <tr>
                      <th className="ps-3 py-2">Código</th>
                      <th className="py-2">Usuario ID</th>
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2">Productos</th>
                      <th className="pe-3 text-end py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(o => (
                      <tr key={o.codigo}>
                        <td className="ps-3 fw-bold text-success">{o.codigo}</td>
                        <td>#{o.usuarioId}</td>
                        <td>{o.fechaPedido}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {ESTADOS_PEDIDO[o.estado] ?? `Estado ${o.estado}`}
                          </span>
                        </td>
                        <td>
                          {(o.items || []).map((it, idx) => (
                            <div key={idx} className="small text-muted">
                              {it.cantidad}x {it.nombre} (${it.precioUnitario?.toLocaleString('es-CL')})
                            </div>
                          ))}
                        </td>
                        <td className="pe-3 text-end fw-bold">${o.total?.toLocaleString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nuevo Producto */}
      {isAdmin && showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white border-0">
                <h5 className="modal-title fw-bold">Agregar Nuevo Producto</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Código</label>
                    <input type="text" className="form-control" placeholder="Ej: FR004" required value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nombre</label>
                    <input type="text" className="form-control" placeholder="Ej: Frutillas Frescas" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Categoría</label>
                      <select className="form-select" required value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                        <option value="frutas">Frutas</option>
                        <option value="verduras">Verduras</option>
                        <option value="organicos">Orgánicos</option>
                        <option value="lacteos">Lácteos</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Precio ($)</label>
                      <input type="number" className="form-control" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Stock Inicial</label>
                      <input type="number" className="form-control" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Unidad (Ej: kg)</label>
                      <input type="text" className="form-control" required value={formData.unidad} onChange={e => setFormData({...formData, unidad: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">URL de la Imagen</label>
                    <input type="text" className="form-control" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-success w-100 fw-bold rounded-pill">Guardar Producto en Catálogo</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Producto */}
      {isAdmin && showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Editar Producto</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nombre</label>
                    <input type="text" className="form-control" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Precio ($)</label>
                    <input type="number" className="form-control" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill">Guardar Cambios</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Producto */}
      {isAdmin && showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">Confirmar Eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="fs-5 mb-4">¿Estás seguro de querer eliminar este elemento?</p>
                <p className="text-muted fw-bold fs-5">{selectedProduct?.name}</p>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill fw-bold" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                  <button type="button" className="btn btn-danger px-4 rounded-pill fw-bold" onClick={confirmDelete}>Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
