import { useState } from 'react';

const ESTADOS = ["Pedido Confirmado", "En Preparación", "En Camino", "Entregado"];

const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO + "T00:00:00"); 
    return fecha.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
};

const Seguimiento = () => {
  const [codigo, setCodigo] = useState('');
  const [pedidoEncontrado, setPedidoEncontrado] = useState(null);
  const [errorBuscando, setErrorBuscando] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const buscarPedido = async (e) => {
      e?.preventDefault();
      const codigoBuscado = codigo.trim().toUpperCase();

      if (codigoBuscado === '') {
          setPedidoEncontrado(null);
          setErrorBuscando(false);
          return;
      }

      setBuscando(true);
      setErrorBuscando(false);
      setPedidoEncontrado(null);

      try {
          const res = await fetch(`http://localhost:8082/api/v1/pedidos/${codigoBuscado}`);
          if (res.status === 404) {
              setErrorBuscando(true);
              setBuscando(false);
              return;
          }
          if (!res.ok) throw new Error('Error al buscar pedido');
          const data = await res.json();
          // data: { codigo, estado, fechaPedido, fechaEntregaEstimada, ... }
          setErrorBuscando(false);
          setPedidoEncontrado(data);
      } catch {
          setErrorBuscando(true);
      }
      setBuscando(false);
  };

  return (
    <main className="container my-5 flex-grow-1">
        <h2 className="text-center mb-4">Seguimiento de Pedido</h2>
        <div className="row justify-content-center">
            <div className="col-md-6">
                <div className="card shadow-sm p-4">
                    <div className="mb-3">
                        <label htmlFor="input-codigo-pedido" className="form-label">Ingrese su número de pedido</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="input-codigo-pedido" 
                          placeholder="Ej: HH-1001"
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value)}
                          onKeyUp={(e) => e.key === 'Enter' && buscarPedido()}
                        />
                    </div>
                    <button id="btn-buscar-pedido" className="btn btn-success w-100" onClick={buscarPedido} disabled={buscando}>
                      {buscando ? 'Buscando...' : 'Consultar Estado'}
                    </button>
                </div>

                <div id="resultado-rastreo" className="mt-4">
                  {errorBuscando && (
                      <div className="alert alert-warning">
                          No encontramos ningún pedido con el código "{codigo.trim().toUpperCase()}".
                          Verifica que esté bien escrito.
                      </div>
                  )}

                  {pedidoEncontrado && (
                      <div className="card shadow-sm p-4">
                          <h5>Pedido {pedidoEncontrado.codigo}</h5>
                          <p className="text-secondary mb-4">Realizado el {formatearFecha(pedidoEncontrado.fechaPedido)}</p>

                          <div className="d-flex align-items-start justify-content-between pasos-container mb-4">
                              {ESTADOS.map((nombrePaso, index) => {
                                  const completado = index <= pedidoEncontrado.estado;
                                  return (
                                      <div key={index} className={`paso-seguimiento ${completado ? "completado" : ""}`}>
                                          <div className="circulo-paso">{completado ? "✓" : index + 1}</div>
                                          <p className="mb-0 small">{nombrePaso}</p>
                                      </div>
                                  );
                              })}
                          </div>

                          <p className="mb-0"><strong>Entrega estimada:</strong> {formatearFecha(pedidoEncontrado.fechaEntregaEstimada)}</p>
                      </div>
                  )}
                </div>
            </div>
        </div>
    </main>
  );
};

export default Seguimiento;
