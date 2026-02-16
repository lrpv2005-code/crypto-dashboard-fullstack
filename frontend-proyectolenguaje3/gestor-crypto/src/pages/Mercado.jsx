import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Busca tu línea de lucide-react y déjala así:
import { TrendingUp, Loader2, BarChart3, Instagram, Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMarketData } from '../Services/api';

// --- COMPONENTES ---
import logoImg from '../assets/components/logo.jpg';
import CryptoChart from '../components/CryptoChart';
import GestionModal from '../components/GestionModal';

const Mercado = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado para la moneda seleccionada
  const [selectedCoin, setSelectedCoin] = useState({
    symbol: 'btc',
    name: 'Bitcoin',
    price: 0
  });

  const fetchPrices = async () => {
    setLoading(true);
    const data = await getMarketData();

    if (data && data.length > 0) {
      // 1. Filtramos solo tus 5 monedas elegidas
      const allowed = ['btc', 'eth', 'doge', 'usdt', 'xrp'];

      const filtered = data.filter(coin =>
        allowed.includes(coin.symbol.toLowerCase())
      );

      setCryptos(filtered);

      // Actualizamos el precio de la moneda seleccionada en el panel lateral si está en la lista
      const currentSelected = filtered.find(c => c.symbol === selectedCoin.symbol);
      if (currentSelected) {
        setSelectedCoin(prev => ({ ...prev, price: currentSelected.current_price }));
      }
    } else {
      console.log("No se recibieron datos de la API");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#050a18', minHeight: '100vh', color: 'white' }}>

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


      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="pt-28 px-4 md:px-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-20">

        {/* COLUMNA IZQUIERDA: TABLA */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-cyan-400">Estado del Mercado</h1>
            {loading && <Loader2 className="animate-spin text-cyan-500" />}
          </div>

          {/* VISTA DE ESCRITORIO: TABLA (Visible solo en md y superior) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800 shadow-2xl">
            <table className="w-full text-left bg-[#0b1120]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5">Activo</th>
                  <th className="p-5 text-right">Precio (USD)</th>
                  <th className="p-5 text-right">Cambio 24h</th>
                  {/* Eliminada la columna de Acción */}
                </tr>
              </thead>
              <tbody>
                {cryptos.map((coin) => (
                  <tr
                    key={coin.id}
                    onClick={() => setSelectedCoin({
                      symbol: coin.symbol,
                      name: coin.name,
                      price: coin.current_price
                    })}
                    className={`border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-all ${selectedCoin.symbol === coin.symbol ? 'bg-slate-800/60 border-l-4 border-l-cyan-500' : ''}`}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <div>
                          <span className="font-bold block">{coin.name}</span>
                          <span className="text-slate-500 text-xs uppercase">{coin.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right font-mono">
                      ${coin.current_price.toLocaleString('es-ES', {
                        minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                        maximumFractionDigits: coin.current_price < 1 ? 4 : 2
                      })}
                    </td>
                    <td className={`p-5 text-right font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    {/* Eliminada la celda de Acción */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL: TARJETAS (Visible solo en pantallas pequeñas) */}
          <div className="md:hidden space-y-4">
            {cryptos.map((coin) => (
              <div
                key={coin.id}
                onClick={() => setSelectedCoin({
                  symbol: coin.symbol,
                  name: coin.name,
                  price: coin.current_price
                })}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedCoin.symbol === coin.symbol
                    ? 'bg-slate-800/80 border-cyan-500 ring-1 ring-cyan-500/50'
                    : 'bg-[#0b1120] border-slate-800 hover:bg-slate-800/40'
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h3 className="font-bold text-white text-lg">{coin.name}</h3>
                      <span className="text-slate-500 text-sm uppercase font-mono">{coin.symbol}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white text-lg font-semibold">
                      ${coin.current_price.toLocaleString('es-ES', {
                        minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                        maximumFractionDigits: coin.current_price < 1 ? 4 : 2
                      })}
                    </p>
                    <p className={`text-sm font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h)?.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Botón Ver Gráfico visible estéticamente como pidió el usuario */}
                <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-end">
                  <button className="flex items-center gap-2 bg-slate-800 hover:bg-cyan-900/30 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-full justify-center">
                    <BarChart3 className="w-4 h-4" />
                    Ver Gráfico
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE GESTIÓN */}
        <div className="lg:w-80">
          <div className="sticky top-28 bg-[#0b1120] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white leading-tight">{selectedCoin.name}</h2>
              <p className="text-cyan-400 font-mono text-sm">
                ${selectedCoin.price < 1 ? selectedCoin.price.toFixed(4) : selectedCoin.price.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 mb-6 bg-slate-900/50">
              <CryptoChart
                symbol={
                  selectedCoin.symbol.toLowerCase() === 'xrp'
                    ? "BINANCE:XRPUSDT"
                    : selectedCoin.symbol.toLowerCase() === 'usdt'
                      ? "BINANCE:USDTUSD" // Cambio clave: USDT contra USD real para que funcione
                      : `${selectedCoin.symbol.toUpperCase()}USDT`
                }
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Gestionar {selectedCoin.symbol.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL DE GESTIÓN --- */}
      <GestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coin={selectedCoin}
      />

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
                <li><Link to="/login" className="hover:text-cyan-400 transition">Mi Inventario</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contacto" className="hover:text-cyan-400 transition">Contacto</Link></li>
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
          <div className="border-t border-slate-900 pt-8 text-center text-xs">
            <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados.</p>
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

export default Mercado;