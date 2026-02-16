import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
// Eliminamos el import de emailjs ya que usaremos tu backend
import {
  TrendingUp, Mail, MessageSquare, Send,
  Phone, Instagram, MapPin, CheckCircle2, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '../assets/components/logo.jpg';

const Contacto = () => {
  const form = useRef();
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- NUEVA FUNCIÓN PARA TU BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    // Recolectamos los datos del formulario
    const formData = new FormData(form.current);
    const data = {
      nombre: formData.get("user_name"),
      email: formData.get("user_email"),
      asunto: formData.get("user_subject"),
      mensaje: formData.get("message"),
    };

    try {
      // Esta es la línea de comando que conecta con tu Django
      const response = await fetch(`${API_BASE_URL}/api/wallet/api/contacto/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setEnviado(true);
        form.current.reset();
        setTimeout(() => setEnviado(false), 5000);
      } else {
        const errorData = await response.json();
        alert("Error del servidor: " + (errorData.error || "No se pudo enviar"));
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. ¿Está encendido el Backend?");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* --- NAVBAR --- */}
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
              <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                CryptoManager
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/mercado" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Mercado
                </Link>
                <Link to="/seguridad" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Seguridad
                </Link>
                <Link to="/login">
                  <button className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-full text-sm font-medium transition-all">
                    Iniciar Sesión
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-xl"
          >
            <Link to="/mercado" className="text-slate-300 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
              Mercado
            </Link>
            <Link to="/seguridad" className="text-slate-300 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
              Seguridad
            </Link>
            <Link to="/login" className="w-full text-left block" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-lg text-base font-medium transition-all">
                Iniciar Sesión
              </button>
            </Link>
          </motion.div>
        )}
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              Ponte en contacto
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Tu mensaje será procesado por nuestro servidor y enviado a José Daniel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Información de Contacto */}
            <div className="space-y-6">

              {/* Botón Instagram (NUEVO) */}
              <a
                href="https://www.instagram.com/danieln0908/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/30 p-6 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-tr from-yellow-500/10 to-purple-500/10 p-3 rounded-xl group-hover:from-yellow-500/20 group-hover:to-purple-500/20 transition-colors">
                    <Instagram className="text-pink-400 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Instagram del soporte</h3>
                  </div>
                </div>
              </a>

              {/* WhatsApp Soporte */}
              <a
                href="https://wa.me/584122080281"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/30 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                    <Phone className="text-emerald-400 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">WhatsApp del soporte</h3>
                  </div>
                </div>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/danieln1304"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/30 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <Send className="text-blue-400 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Telegram del soporte</h3>
                  </div>
                </div>
              </a>

              {/* Ubicación */}
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-xl">
                    <MapPin className="text-purple-400 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Ubicación</h3>
                    <p className="text-slate-400 text-sm">Maracay, Aragua, Venezuela.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Formulario conectado al Backend */}
            <div className="lg:col-span-2 bg-slate-800/20 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
              {enviado ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce" />
                  <h3 className="text-2xl font-bold text-white">¡Mensaje Enviado!</h3>
                  <p className="text-slate-400">El servidor ha enviado tu correo exitosamente.</p>
                </div>
              ) : (
                <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                      <input
                        name="user_name"
                        required
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tu Correo</label>
                      <input
                        name="user_email"
                        required
                        type="email"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Asunto</label>
                    <input
                      name="user_subject"
                      required
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Tema de tu consulta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Mensaje</label>
                    <textarea
                      name="message"
                      required
                      rows="4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Escribe aquí..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={cargando}
                    className={`w-full ${cargando ? 'bg-slate-700' : 'bg-cyan-500 hover:bg-cyan-600'} text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
                  >
                    <Send className="h-5 w-5" />
                    {cargando ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800 py-16 bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center">
                <span className="text-cyan-400 mr-2">◈</span> CryptoManager
              </h3>
              <p className="text-sm leading-relaxed">
                Gestión avanzada de activos digitales con datos en tiempo real y seguridad Cold Storage.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-400 transition">Inicio</Link></li>
                <li><Link to="/mercado" className="hover:text-cyan-400 transition">Mercado</Link></li>
                <li><Link to="/login" className="hover:text-cyan-400 transition">Mi Inventario</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/seguridad" className="hover:text-cyan-400 transition">Centro de seguridad</Link></li>
                <li><a href="/faq" className="hover:text-cyan-400 transition">Preguntas Frecuentes</a></li>
                <li><Link to="/terminos#terminos" className="hover:text-cyan-400 transition">Términos y condiciones</Link></li>
                <li><Link to="/terminos#privacidad" className="hover:text-cyan-400 transition">Política de privacidad</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-bold mb-6">Mantente al día</h3>
              <div className="flex gap-4 mb-6">
                <SocialIcon href="https://www.instagram.com/danieln0908/" Icon={Instagram} hover="hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-500" />
                <SocialIcon href="https://t.me/danieln1304" Icon={Send} hover="hover:bg-[#0088cc] hover:border-[#0088cc] hover:shadow-[0_0_15px_rgba(0,136,204,0.5)]" />
                <SocialIcon href="https://wa.me/584122080281" Icon={MessageCircle} hover="hover:bg-emerald-500" />
              </div>
              <p className="text-slate-500 text-sm">Sigue nuestras actualizaciones.</p>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 text-center text-xs space-y-2">
            <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados.</p>
            <div className="pt-2 flex flex-col items-center">
              <p className="font-semibold text-slate-500 mb-2">Equipo de Desarrollo:</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-1 sm:gap-x-6 text-slate-400">
                <span className="whitespace-nowrap">José Navas (V-31.116.782)</span>
                <span className="whitespace-nowrap">Juan Colmenares (V-28.586.636)</span>
                <span className="whitespace-nowrap">Kristhian Noriega (V-25.411.246)</span>
                <span className="whitespace-nowrap">Luis Puebla (V-31.357.905)</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SocialIcon = ({ href, Icon, hover }) => (
  <a
    href={href} target="_blank" rel="noopener noreferrer"
    className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 ${hover}`}
  >
    <Icon size={20} />
  </a>
);

export default Contacto;