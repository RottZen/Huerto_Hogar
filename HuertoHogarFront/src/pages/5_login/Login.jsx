import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regPassword !== regConfirm) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }
    setRegLoading(true);
    const result = await register(regName, regEmail, regPassword);
    setRegLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setRegError(result.message);
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
                <div className="card shadow-sm border-0 card-auth">
                    <div className="card-body p-4">
                        <ul className="nav nav-pills nav-justified mb-4" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')} type="button">Iniciar Sesión</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link ${activeTab === 'registro' ? 'active' : ''}`} onClick={() => setActiveTab('registro')} type="button">Registrarse</button>
                            </li>
                        </ul>

                        <div className="tab-content">
                            {activeTab === 'login' && (
                              <div className="tab-pane fade show active" role="tabpanel">
                                  <h3 className="text-center mb-3">¡Bienvenido de vuelta!</h3>
                                  {loginError && <div className="alert alert-danger py-2">{loginError}</div>}
                                  <form onSubmit={handleLoginSubmit}>
                                      <div className="mb-3">
                                          <label className="form-label">Correo Electrónico</label>
                                          <input type="email" className="form-control" placeholder="ejemplo@correo.cl" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                                      </div>
                                      <div className="mb-3">
                                          <label className="form-label">Contraseña</label>
                                          <input type="password" className="form-control" placeholder="••••••" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                                      </div>
                                      <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loginLoading}>
                                        {loginLoading ? 'Iniciando sesión...' : 'Ingresar'}
                                      </button>
                                  </form>
                              </div>
                            )}

                            {activeTab === 'registro' && (
                              <div className="tab-pane fade show active" role="tabpanel">
                                  <h3 className="text-center mb-3">Crea tu cuenta</h3>
                                  {regError && <div className="alert alert-danger py-2">{regError}</div>}
                                  <form onSubmit={handleRegisterSubmit}>
                                      <div className="mb-3">
                                          <label className="form-label">Nombre Completo</label>
                                          <input type="text" className="form-control" placeholder="Juan Pérez" required value={regName} onChange={e => setRegName(e.target.value)} />
                                      </div>
                                      <div className="mb-3">
                                          <label className="form-label">Correo Electrónico</label>
                                          <input type="email" className="form-control" placeholder="ejemplo@correo.cl" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                                      </div>
                                      <div className="mb-3">
                                          <label className="form-label">Contraseña</label>
                                          <input type="password" className="form-control" placeholder="Mínimo 6 caracteres" required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                                      </div>
                                      <div className="mb-4">
                                          <label className="form-label">Confirmar Contraseña</label>
                                          <input type="password" className="form-control" placeholder="••••••" required value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                                      </div>
                                      <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={regLoading}>
                                        {regLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                      </button>
                                  </form>
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
};

export default Login;
