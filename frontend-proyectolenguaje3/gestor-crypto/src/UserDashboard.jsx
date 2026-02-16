import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import { Link } from 'react-router-dom';
import GestionModal from './components/GestionModal';
import ProfileModal from './components/ProfileModal';
import CryptoChart from './components/CryptoChart';
import logoImg from './assets/components/logo.jpg';
import { TrendingUp, History, Wallet, ArrowRight, ArrowDownLeft, ArrowUpRight, LogOut, Download, User, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react';

const COLORS = ['#F7931A', '#F3BA2F', '#3C3C3D', '#26A17B', '#627EEA', '#000000', '#222222'];
const SYMBOL_COLORS = {
    'BTC': '#F7931A',
    'DOGE': '#F3BA2F',
    'ETH': '#627EEA',
    'USDT': '#26A17B',
    'XPR': '#A855F7', // Proton (Morado)
    'XRP': '#000000', // Ripple (Negro/Oscuro)
};

const CRYPTO_LOGOS = {
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    'XPR': 'https://cryptologos.cc/logos/proton-xpr-logo.png',
    'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
};

// --- COMPONENTE DE GRÁFICO MANUAL (SVG) INTERACTIVO ---
const PortfolioPieChart = ({ data }) => {
    const [activeIndex, setActiveIndex] = React.useState(null);

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.valor, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const activeItem = activeIndex !== null ? data[activeIndex] : null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full p-6 select-none">
            <div className="relative w-64 h-64">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full">
                    {data.map((slice, index) => {
                        const symbol = slice.simbolo ? slice.simbolo.toUpperCase() : '';
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += slice.valor / total;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = slice.valor / total > 0.5 ? 1 : 0;
                        const isHovered = activeIndex === index;

                        const pathData = [
                            `M ${startX} ${startY}`,
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `L 0 0`,
                        ].join(' ');

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={SYMBOL_COLORS[symbol] || COLORS[index % COLORS.length]}
                                className={`transition-all cursor-default ${isHovered ? 'scale-[1.05]' : 'opacity-80'}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                style={{ transformOrigin: '0 0' }}
                            />
                        );
                    })}

                    {/* Fondo del centro (Doughnut) */}
                    <circle cx="0" cy="0" r="0.75" fill="#0f172a" />

                    {/* Contenido en el centro (Logo e Info) */}
                    {activeItem ? (
                        <>
                            {/* Logo usando SVG image para máxima estabilidad y evitar 'barras' */}
                            {CRYPTO_LOGOS[activeItem.simbolo?.toUpperCase()] && (
                                <image
                                    href={CRYPTO_LOGOS[activeItem.simbolo?.toUpperCase()]}
                                    x="-0.15"
                                    y="-0.4"
                                    width="0.3"
                                    height="0.3"
                                    className="transform rotate-90"
                                    style={{ transformOrigin: '0 0' }}
                                />
                            )}

                            {/* Textos usando SVG puro */}
                            <text x="0" y="0.2" textAnchor="middle" fill="white" className="font-bold text-[0.15px] transform rotate-90" style={{ fontSize: '0.12px' }}>
                                {activeItem.simbolo}
                            </text>
                            <text x="0" y="0.35" textAnchor="middle" fill="#10b981" className="font-bold transform rotate-90" style={{ fontSize: '0.15px' }}>
                                ${activeItem.valor.toLocaleString()}
                            </text>
                            <text x="0" y="0.5" textAnchor="middle" fill="#94a3b8" className="transform rotate-90" style={{ fontSize: '0.08px' }}>
                                Venta: ${activeItem.precio_actual?.toLocaleString()}
                            </text>
                        </>
                    ) : (
                        <>
                            <text x="0" y="-0.05" textAnchor="middle" fill="#64748b" className="font-bold uppercase tracking-widest transform rotate-90" style={{ fontSize: '0.1px' }}>
                                Total
                            </text>
                            <text x="0" y="0.15" textAnchor="middle" fill="white" className="font-bold transform rotate-90" style={{ fontSize: '0.2px' }}>
                                ${total.toLocaleString()}
                            </text>
                        </>
                    )}
                </svg>
            </div>

            {/* Leyenda personalizada */}
            <div className="flex flex-col gap-3 min-w-[200px]">
                {data.map((item, index) => {
                    const symbol = item.simbolo ? item.simbolo.toUpperCase() : '';
                    const hasLogo = CRYPTO_LOGOS[symbol];
                    const color = SYMBOL_COLORS[symbol] || COLORS[index % COLORS.length];

                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded-lg transition-all ${activeIndex === index ? 'bg-slate-800 ring-1 ring-slate-700' : ''}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            <div className="flex items-center gap-3">
                                {hasLogo ? (
                                    <img
                                        src={CRYPTO_LOGOS[symbol]}
                                        alt={symbol}
                                        className={`w-5 h-5 rounded-full object-cover ${symbol === 'XRP' ? 'bg-slate-200 p-[1px]' : 'bg-white/10'}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block'; // Mostrar el fallback si existe
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="w-5 h-5 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                                {/* Fallback oculto por defecto, se muestra si falla la imagen */}
                                {hasLogo && (
                                    <div
                                        className="w-5 h-5 rounded-full hidden"
                                        style={{ backgroundColor: color }}
                                    />
                                )}

                                <span className="text-sm font-bold text-slate-200">{item.simbolo}</span>
                            </div>
                            <span className="text-sm text-slate-400 font-mono">${item.valor.toLocaleString()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const UserDashboard = () => {
    const [criptos, setCriptos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [dashboardData, setDashboardData] = useState({ activos: [], balance_total: 0 });
    const [formData, setFormData] = useState({
        currency: '',
        type: 'buy', // 'buy' o 'sell'
        amount_crypto: '',
        amount_usd: ''
    });
    const [mensaje, setMensaje] = useState(null);
    const [modalError, setModalError] = useState({ isOpen: false, message: '' });
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [usuario, setUsuario] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [selectedTx, setSelectedTx] = useState(null);

    const filteredHistorial = historial.filter(tx => {
        if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
        if (filterType !== 'all' && tx.type !== filterType) return false;
        return true;
    });

    // 1. Cargar datos iniciales
    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('usuario') || '{}');
        setUsuario(localUser);

        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                // Cargar Monedas
                const resCriptos = await fetch(`${API_BASE_URL}/api/criptos/`, { headers });
                const dataCriptos = await resCriptos.json();
                setCriptos(dataCriptos);
                if (dataCriptos.length > 0) setFormData(prev => ({ ...prev, currency: dataCriptos[0].id }));

                // Cargar Historial
                const resHist = await fetch(`${API_BASE_URL}/api/transacciones/historial/`, { headers });
                const dataHist = await resHist.json();
                setHistorial(Array.isArray(dataHist) ? dataHist : []);

                // Cargar Dashboard Data
                const resDash = await fetch(`${API_BASE_URL}/api/wallet/dashboard/`, { headers });
                const dataDash = await resDash.json();
                setDashboardData(dataDash);

            } catch (error) {
                console.error("Error cargando datos", error);
            }
        };
        fetchData();
    }, []);

    // 2. Para crear las transacciones
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_BASE_URL}/api/transacciones/crear/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ type: 'success', text: '¡Solicitud enviada con éxito!' });
                // Recargar historial y dashboard
                const headers = { 'Authorization': `Bearer ${token}` };
                const resHist = await fetch(`${API_BASE_URL}/api/transacciones/historial/`, { headers });
                setHistorial(await resHist.json());

                const resDash = await fetch(`${API_BASE_URL}/api/wallet/dashboard/`, { headers });
                setDashboardData(await resDash.json());

            } else {
                let errorText = 'Error: Verifique los datos';

                if (data) {
                    if (data.non_field_errors && data.non_field_errors.length > 0) {
                        errorText = data.non_field_errors[0];
                    }
                    else if (Array.isArray(data) && data.length > 0) {
                        errorText = data[0];
                    }
                    else if (typeof data === 'object') {
                        const keys = Object.keys(data);
                        if (keys.length > 0) {
                            const firstError = data[keys[0]];
                            if (Array.isArray(firstError)) {
                                errorText = firstError[0];
                            } else {
                                errorText = String(firstError);
                            }
                        }
                    }
                }

                if (typeof errorText === 'string') {
                    if (errorText.includes("Saldo insuficiente") || errorText.includes("No tienes saldo") || errorText.includes("No puedes vender")) {
                        errorText = "Usted no posee el saldo que desea vender";
                    }
                    else if (errorText.includes("monto es muy bajo") || errorText.includes("minimo es de 1 USD") || errorText.includes("monto mínimo")) {
                        errorText = "El minimo de compra o venta es de 1 USD";
                    }
                }

                setMensaje({ type: 'error', text: errorText });
            }
        } catch (error) {
            setMensaje({ type: 'error', text: 'Error de conexión' });
        }
        setTimeout(() => setMensaje(null), 3000);
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setModalError({ isOpen: true, message: "No se encontró token de autenticación. Por favor inicia sesión nuevamente." });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/transactions/exportar_excel/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al descargar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
            a.download = `historial_transacciones_${timestamp}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error descargando excel:", error);
            setModalError({ isOpen: true, message: "Hubo un error al descargar el reporte. Inténtalo de nuevo más tarde." });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-cyan-500 selection:text-white">

            {/* NAVBAR */}
            {/* NAVBAR */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo y Título */}
                        <div className="flex items-center gap-3">
                            <Link to="/" className="bg-slate-800/80 p-2 pr-4 rounded-xl border border-slate-700/50 flex items-center gap-3 hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm">
                                <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                                <div className="flex flex-col justify-center">
                                    <span className="font-bold text-sm tracking-wide text-slate-200 leading-none">Mi Portafolio</span>
                                </div>
                            </Link>
                        </div>

                        {/* Menú de Usuario */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="group flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50 hover:border-slate-600 transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{usuario?.first_name || usuario?.username || usuario?.name || 'Usuario'}</p>
                                </div>
                                <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all">
                                    {usuario?.avatar ? (
                                        <img src={usuario.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4 text-slate-300" />
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* --- SECCIÓN RESUMEN FINANCIERO (SVG SEGURO) --- */}
                <div className="mb-10 p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <DollarSign className="text-cyan-400" /> Resumen Financiero
                    </h2>
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold mb-4">Distribución de Portafolio</h3>
                        {dashboardData.activos && dashboardData.activos.length > 0 ? (
                            <PortfolioPieChart data={dashboardData.activos} />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                                <Wallet className="h-12 w-12 mb-2 opacity-20" />
                                <p>No hay activos aún</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SECCIÓN MIS ACTIVOS (SEGÚN REFERENCIA) --- */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Wallet className="text-cyan-400" /> Mis Activos
                    </h2>

                    <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                        <div className="divide-y divide-slate-800/50">
                            {dashboardData.activos && dashboardData.activos.length > 0 ? (
                                dashboardData.activos.map((activo, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            {/* Borde lateral de color */}
                                            <div
                                                className="w-1.5 h-12 rounded-full"
                                                style={{ backgroundColor: SYMBOL_COLORS[activo.simbolo] || COLORS[index % COLORS.length] }}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg text-slate-100">{activo.simbolo}</span>
                                                    <span className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded border border-slate-600 font-mono">
                                                        ${activo.precio_actual?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{activo.nombre}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-0 w-full sm:w-auto text-left sm:text-right">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-baseline justify-between sm:justify-end gap-2">
                                                    <span className="text-xs text-slate-500 font-bold uppercase sm:hidden">Saldo</span>
                                                    <span className="font-mono text-lg text-slate-200">
                                                        {activo.cantidad.toFixed(activo.simbolo === 'USDT' ? 2 : 6)} <span className="text-slate-500 text-sm">{activo.simbolo}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline justify-between sm:justify-end gap-2">
                                                    <span className="text-xs text-slate-500 font-bold uppercase sm:hidden">Valor</span>
                                                    <span className="text-sm font-bold text-emerald-400">
                                                        <span className="opacity-50 text-xs mr-1">≈</span>
                                                        ${activo.valor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-500 italic">
                                    No tienes activos en tu billetera en este momento.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- COLUMNA IZQUIERDA: NUEVA OPERACIÓN --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Wallet className="text-cyan-400" /> Nueva Operación
                            </h2>

                            {mensaje && (
                                <div className={`mb-4 p-3 rounded-lg text-sm text-center font-medium ${mensaje.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {mensaje.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Criptomoneda</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                        value={formData.currency}
                                        onChange={(e) => {
                                            const newCurrency = e.target.value;
                                            const sel = criptos.find(c => String(c.id) === String(newCurrency));
                                            const price = sel && sel.preciousd ? Number(sel.preciousd) : 0;
                                            let amount_crypto = formData.amount_crypto;
                                            let amount_usd = formData.amount_usd;
                                            if (amount_usd && price > 0) {
                                                amount_crypto = (Number(amount_usd) / price).toString();
                                            } else if (amount_crypto && price > 0) {
                                                amount_usd = (Number(amount_crypto) * price).toFixed(2).toString();
                                            }
                                            setFormData({ ...formData, currency: newCurrency, amount_crypto, amount_usd });
                                        }}
                                    >
                                        {criptos.map(coin => (
                                            <option key={coin.id} value={coin.id}>{coin.nombrecripto} ({coin.simbolo})</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.currency && (
                                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50">
                                        <CryptoChart
                                            symbol={(() => {
                                                const sel = criptos.find(c => String(c.id) === String(formData.currency));
                                                if (!sel) return "BTCUSDT";
                                                const symbol = sel.simbolo?.toUpperCase();
                                                if (symbol === 'XPR') return "KUCOIN:XPRUSDT";
                                                if (symbol === 'USDT') return "BINANCE:USDTUSD";
                                                return `${symbol}USDT`;
                                            })()}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Operación</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'buy' })}
                                            className={`p-3 rounded-lg font-bold transition-all ${formData.type === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                        >
                                            COMPRAR
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'sell' })}
                                            className={`p-3 rounded-lg font-bold transition-all ${formData.type === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                        >
                                            VENDER
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Cantidad</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Cantidad USD</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                                placeholder="USD 0.00"
                                                value={formData.amount_usd}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const sel = criptos.find(c => String(c.id) === String(formData.currency));
                                                    const price = sel && sel.preciousd ? Number(sel.preciousd) : 0;
                                                    let crypto = '';
                                                    if (price > 0 && val !== '') crypto = (Number(val) / price).toString();
                                                    setFormData({ ...formData, amount_usd: val, amount_crypto: crypto });
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Cantidad Cripto</label>
                                            <input
                                                type="number"
                                                step="0.00000001"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                                placeholder="0.00000000"
                                                value={formData.amount_crypto}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const sel = criptos.find(c => String(c.id) === String(formData.currency));
                                                    const price = sel && sel.preciousd ? Number(sel.preciousd) : 0;
                                                    let usd = '';
                                                    if (price > 0 && val !== '') usd = (Number(val) * price).toFixed(2).toString();
                                                    setFormData({ ...formData, amount_crypto: val, amount_usd: usd });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex justify-center items-center gap-2">
                                    Procesar Solicitud <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- COLUMNA DERECHA: HISTORIAL --- */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History className="text-cyan-400" /> Historial de Transacciones
                            </h2>
                            <button
                                onClick={handleDownloadExcel}
                                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-500/20 transition-all"
                            >
                                <Download className="h-4 w-4" /> Exportar Excel
                            </button>
                        </div>

                        {/* FILTROS */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-3">
                            <div className="bg-slate-800/50 border border-slate-700/50 p-1 rounded-lg flex overflow-x-auto">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'pending' ? 'bg-orange-500/20 text-orange-400 shadow ring-1 ring-orange-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Pendientes
                                </button>
                                <button
                                    onClick={() => setFilterStatus('approved')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 shadow ring-1 ring-emerald-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Aprobadas
                                </button>
                                <button
                                    onClick={() => setFilterStatus('rejected')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterStatus === 'rejected' ? 'bg-red-500/20 text-red-400 shadow ring-1 ring-red-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Rechazadas
                                </button>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700/50 p-1 rounded-lg flex overflow-x-auto">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setFilterType('buy')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterType === 'buy' ? 'bg-emerald-500/20 text-emerald-400 shadow ring-1 ring-emerald-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Compras
                                </button>
                                <button
                                    onClick={() => setFilterType('sell')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterType === 'sell' ? 'bg-cyan-500/20 text-cyan-400 shadow ring-1 ring-cyan-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Ventas
                                </button>
                            </div>
                        </div>

                        {/* VISTA DE TARJETAS (GRID) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredHistorial.map((tx) => (
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedTx(tx)}
                                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 hover:bg-slate-800/50 transition-all cursor-pointer group flex items-start justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* ICONO TIPO TRANSACCION */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${tx.type === 'buy'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {tx.type === 'buy' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-200">{tx.simbolo_moneda}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'}`}>
                                                    {tx.type === 'buy' ? 'Compra' : 'Venta'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        {/* ESTADO CON ICONOS SOLICITADOS */}
                                        {tx.status === 'approved' && (
                                            <div title="Aprobada" className="text-emerald-500">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        )}
                                        {tx.status === 'pending' && (
                                            <div title="Pendiente" className="text-orange-400">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                        )}
                                        {tx.status === 'rejected' && (
                                            <div title="Rechazada" className="text-red-500">
                                                <XCircle className="h-5 w-5" />
                                            </div>
                                        )}

                                        <div className="text-right mt-1">
                                            <div className="font-bold text-slate-100 text-sm">
                                                $ {Number(tx.amount_usd).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400">
                                                {Number(tx.amount_crypto).toLocaleString('es-ES', { maximumFractionDigits: 8 })} {tx.simbolo_moneda}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredHistorial.length === 0 && (
                            <div className="p-12 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
                                {historial.length === 0 ? "No hay movimientos aún." : "No se encontraron transacciones con estos filtros."}
                            </div>
                        )}
                    </div>

                </div>

                <div className="mt-16 text-center text-xs text-slate-600 pb-4">
                    <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <a href="/terminos#privacidad" className="hover:text-slate-400">Privacidad</a>
                        <a href="/terminos#terminos" className="hover:text-slate-400">Términos</a>
                    </div>
                </div>
            </main>

            {/* MODAL DETALLE DE TRANSACCIÓN */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Detalle de Transacción
                            </h3>
                            <button
                                onClick={() => setSelectedTx(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* ESTADO GRANDE */}
                            <div className="flex flex-col items-center justify-center py-4">
                                {selectedTx.status === 'approved' && (
                                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 border border-emerald-500/20">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    </div>
                                )}
                                {selectedTx.status === 'pending' && (
                                    <div className="h-16 w-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-3 border border-orange-500/20">
                                        <Clock className="h-8 w-8 text-orange-400" />
                                    </div>
                                )}
                                {selectedTx.status === 'rejected' && (
                                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-3 border border-red-500/20">
                                        <XCircle className="h-8 w-8 text-red-500" />
                                    </div>
                                )}
                                <span className={`text-lg font-bold uppercase tracking-wider ${selectedTx.status === 'approved' ? 'text-emerald-400' :
                                    selectedTx.status === 'pending' ? 'text-orange-400' : 'text-red-400'
                                    }`}>
                                    {selectedTx.status === 'approved' ? 'Aprobada' :
                                        selectedTx.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                                </span>
                            </div>

                            {/* INFO GRID */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-1">Tipo</p>
                                    <p className={`font-bold uppercase ${selectedTx.type === 'buy' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                        {selectedTx.type === 'buy' ? 'Compra' : 'Venta'}
                                    </p>
                                </div>
                                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-1">Moneda</p>
                                    <p className="font-bold text-white">{selectedTx.simbolo_moneda}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Monto Cripto</span>
                                    <span className="text-white font-mono font-medium">
                                        {Number(selectedTx.amount_crypto).toLocaleString('es-ES', { maximumFractionDigits: 8 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">Valor USD</span>
                                    <span className="text-white font-bold text-lg">
                                        $ {Number(selectedTx.amount_usd).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                    <span className="text-slate-400 text-sm">ID Transacción</span>
                                    <span className="text-slate-500 font-mono text-xs">#{selectedTx.id}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-slate-400 text-sm">Fecha</span>
                                    <span className="text-slate-300 text-sm">
                                        {new Date(selectedTx.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex justify-center">
                            <button
                                onClick={() => setSelectedTx(null)}
                                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GestionModal
                isOpen={modalError.isOpen}
                onClose={() => setModalError({ ...modalError, isOpen: false })}
                type="error"
                title="Error de Descarga"
                message={modalError.message}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default UserDashboard;
