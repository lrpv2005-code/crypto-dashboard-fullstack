import React, { useState } from 'react';
import GestionModal from './components/GestionModal';
import { API_BASE_URL } from './config';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from './assets/components/logo.jpg';
import { Mail, Lock, User, CheckCircle2, ArrowRight, TrendingUp, Eye, EyeOff, LogOut } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'error', title: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // VALIDACIÓN ESPECÍFICA POR CAMPO (Secuencial como pidió el usuario)

    // 1. Validar Nombre Completo (Solo registro)
    if (!isLogin && !formData.nombre.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Campo Obligatorio',
        message: 'Por favor, ingresa tu Nombre Completo para continuar.'
      });
      return;
    }

    // 2. Validar Nombre de Usuario (Solo registro)
    if (!isLogin && !formData.username.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Campo Obligatorio',
        message: 'Debes elegir un Nombre de Usuario para identificarte.'
      });
      return;
    }

    // 3. Validar Email
    if (!formData.email.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Campo Obligatorio',
        message: 'El Correo Electrónico es necesario para iniciar sesión o registrarte.'
      });
      return;
    }

    // 4. Validar Contraseña (Vacía)
    if (!formData.password.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Campo Obligatorio',
        message: 'Por favor, ingresa tu Contraseña.'
      });
      return;
    }

    // 5. Validar Longitud de Contraseña (Solo registro)
    if (!isLogin && formData.password.length < 8) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Contraseña Insegura',
        message: 'La contraseña debe tener al menos 8 caracteres para mayor seguridad.'
      });
      return;
    }


    setLoading(true);

    const url = isLogin
      ? `${API_BASE_URL}/api/token/`
      : `${API_BASE_URL}/api/users/registro/`;

    const payload = {
      email: formData.email,
      username: isLogin ? formData.email : formData.username,
      password: formData.password,
      first_name: formData.nombre
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);

          const userData = {
            name: data.first_name || formData.email.split('@')[0],
            first_name: data.first_name,
            email: data.email,
            id: data.id,
            isAdmin: data.is_staff,
            avatar: data.image_url
          };

          localStorage.setItem('usuario', JSON.stringify(userData));

          if (userData.isAdmin === true) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }

        } else {
          setIsRegistered(true); // Activa la vista de éxito
        }
      } else {
        // MANEJO DE ERRORES DEL BACKEND
        // El backend devuelve { error: "Mensaje" } o estandar DRF { key: ["msg"] }

        let errorTitle = 'Error de Autenticación';
        // Prioridad: data.error (Manual) -> data.detail (DRF) -> Primer valor de array (DRF validacion)
        let errorMsg = data.error || data.detail;

        if (!errorMsg) {
          // Si no hay error/detail, buscamos en keys posibles (estandar DRF)
          if (data.username) errorMsg = data.username[0];
          else if (data.email) errorMsg = data.email[0];
          else if (data.password) errorMsg = data.password[0];
          else errorMsg = 'Verifica tus datos e inténtalo de nuevo.';
        }

        // Detectar tipo de error por el contenido del mensaje
        const msgLower = errorMsg.toLowerCase();

        if (msgLower.includes('nombre de usuario ya está en uso') || msgLower.includes('already exists')) {
          errorTitle = 'Usuario No Disponible';
          errorMsg = `El nombre de usuario "${formData.username}" ya está en uso. Por favor elige otro.`;
        } else if (msgLower.includes('correo electrónico ya está registrado') || msgLower.includes('email already exists')) {
          errorTitle = 'Correo Ya Registrado';
          errorMsg = `El correo "${formData.email}" ya tiene una cuenta asociada. Intenta iniciar sesión.`;
        } else if (response.status === 401 || msgLower.includes('credenciales')) {
          errorTitle = 'Credenciales Incorrectas';
          errorMsg = 'El correo o la contraseña no son correctos.';
        }

        setError('Error: ' + errorMsg);
        setModalState({
          isOpen: true,
          type: 'error',
          title: errorTitle,
          message: errorMsg
        });
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor.');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu internet o inténtalo más tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-50 selection:bg-cyan-500 selection:text-white">

      {/* --- LADO IZQUIERDO (DECORATIVO) --- */}
      <div className="hidden md:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center justify-between mb-12 w-full">
            <Link to="/" className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-700 p-2 pr-4 rounded-xl backdrop-blur-sm hover:border-cyan-500 transition-colors">
              <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-bold tracking-tight text-white">CryptoManager</span>
            </Link>
          </div>
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">Gestiona tus activos con <span className="text-cyan-400">Seguridad Garantizada</span>.</h2>
        </div>
      </div>

      {/* --- LADO DERECHO (FORMULARIO) --- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-sm md:max-w-md my-auto">

          {isRegistered ? (
            /* --- VISTA DE ÉXITO --- */
            <div className="text-center animate-in zoom-in duration-300">
              <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 className="text-emerald-400 w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">¡Cuenta creada!</h2>
              <p className="text-slate-400 mb-8">
                Tu registro en <strong>CryptoManager</strong> fue exitoso. Ya puedes iniciar sesión con tus credenciales.
              </p>
              <button
                onClick={() => { setIsRegistered(false); setIsLogin(true); }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                Ir al Inicio de Sesión
              </button>
            </div>
          ) : (
            /* --- VISTA DE LOGIN / REGISTRO --- */
            <>
              {/* LOGO VISIBLE SOLO EN MÓVIL */}
              <div className="md:hidden flex justify-center mb-8">
                <Link to="/" className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 p-2 pr-4 rounded-xl backdrop-blur-sm hover:border-cyan-500/50 transition-colors">
                  <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
                  <span className="font-bold tracking-tight text-white text-sm">CryptoManager</span>
                </Link>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
                <p className="text-slate-400">{isLogin ? 'Ingresa tus credenciales.' : 'Completa el formulario.'}</p>
              </div>

              {error && <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm text-center border border-red-500/20">{error}</div>}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nombre de Usuario</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Ej. juan123"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nombre@ejemplo.com"
                      autoComplete="off"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-300">Contraseña</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowRecovery(true)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="off"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-12 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                  {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-400">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); setIsRegistered(false); }} className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                  {isLogin ? 'Regístrate gratis' : 'Inicia Sesión'}
                </button>
              </div>
            </>
          )}

          {/* Footer movido un poco más abajo con margen superior */}
          <div className="mt-8 text-center text-xs text-slate-500">
            <p>&copy; 2026 CryptoManager. Todos los derechos reservados.</p>

            <div className="mt-4 pt-4 border-t border-slate-800/50">
              <p className="font-semibold mb-2 text-slate-400">Desarrollado por:</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-1 sm:gap-x-6 text-slate-500">
                <span className="whitespace-nowrap">José Navas (V-31.116.782)</span>
                <span className="whitespace-nowrap">Juan Colmenares (V-28.586.636)</span>
                <span className="whitespace-nowrap">Kristhian Noriega (V-25.411.246)</span>
                <span className="whitespace-nowrap">Luis Puebla (V-31.357.905)</span>
              </div>
            </div>

            <div className="mt-4 space-x-4">
              <a href="/terminos#privacidad" className="hover:text-slate-400">Privacidad</a>
              <a href="/terminos#terminos" className="hover:text-slate-400">Términos</a>
            </div>
          </div>

        </div>
      </div>
      <RecoveryModal
        isOpen={showRecovery}
        onClose={() => setShowRecovery(false)}
        setModalState={setModalState}
      />
      <GestionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
};

/* --- NUEVO: MODAL DE RECUPERACIÓN --- */
const RecoveryModal = ({ isOpen, onClose, setModalState }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Correo Requerido',
        message: 'Por favor, ingresa tu correo electrónico.'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/recuperar-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Solicitud Enviada',
          message: data.message || 'Se ha registrado tu solicitud. Te contactaremos pronto.'
        });
        onClose();
        setEmail('');
      } else {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: data.error || 'No se pudo procesar la solicitud.'
        });
      }
    } catch (err) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-[90%] sm:max-w-sm rounded-[2rem] p-6 sm:p-8 shadow-2xl scale-in-center animate-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <Mail className="text-cyan-400 w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">Recuperar Clave</h3>
          <p className="text-sm text-slate-400 mt-2">Ingresa tu correo para recibir instrucciones.</p>
        </div>

        <form onSubmit={handleRecover} className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-slate-500 hover:text-slate-300 text-xs font-semibold tracking-wider uppercase pt-2"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;