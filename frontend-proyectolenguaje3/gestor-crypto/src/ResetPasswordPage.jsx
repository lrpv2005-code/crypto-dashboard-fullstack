import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import GestionModal from './components/GestionModal';
import { API_BASE_URL } from './config';

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 8) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Contraseña Débil',
                message: 'La contraseña debe tener al menos 8 caracteres.'
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Error de Coincidencia',
                message: 'Las contraseñas no coinciden.'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/wallet/confirmar-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    token,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setModalState({
                    isOpen: true,
                    type: 'success',
                    title: '¡Éxito!',
                    message: 'Tu contraseña ha sido actualizada. Serás redirigido al login.'
                });
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setModalState({
                    isOpen: true,
                    type: 'error',
                    title: 'Error',
                    message: data.error || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.'
                });
            }
        } catch (err) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Error de Red',
                message: 'No se pudo conectar con el servidor.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-xl shadow-cyan-500/5">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Nueva Contraseña</h1>
                    <p className="text-slate-400 mt-2">Crea una clave segura para tu cuenta</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Nueva Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 caracteres"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-12 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Confirmar Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repite tu contraseña"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span>Procesando...</span>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    <span>Guardar Nueva Contraseña</span>
                                </>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full mt-6 flex items-center justify-center space-x-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        <span>Volver al inicio de sesión</span>
                    </button>
                </div>

                <p className="text-center text-slate-600 text-xs mt-8">
                    &copy; 2026 CryptoManager. Todos los derechos reservados.
                </p>
            </div>

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

export default ResetPasswordPage;
