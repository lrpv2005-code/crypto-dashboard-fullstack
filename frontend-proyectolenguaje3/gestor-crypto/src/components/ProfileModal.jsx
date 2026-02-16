import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Lock, Upload, Key, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ProfileModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPasswords, setShowPasswords] = useState(false);
    const [showFileError, setShowFileError] = useState(false);

    // User Info
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        first_name: '',
        image: null,
        last_profile_update: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [lockMessage, setLockMessage] = useState('');

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            setMessage(null);
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/perfil/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserData({
                    username: data.username,
                    email: data.email,
                    first_name: data.first_name || '',
                    image: data.profile?.image || null,
                    last_profile_update: data.profile?.last_profile_update || null
                });

                if (data.profile?.last_profile_update) {
                    const lastUpdate = new Date(data.profile.last_profile_update);
                    const now = new Date();
                    const diffMs = now - lastUpdate;
                    const hoursPassed = diffMs / (1000 * 60 * 60);

                    if (hoursPassed < 72) {
                        setIsLocked(true);
                        const remainingHours = Math.ceil(72 - hoursPassed);
                        setLockMessage(`Debes esperar ${remainingHours} horas para realizar otro cambio.`);
                    } else {
                        setIsLocked(false);
                    }
                }

                if (data.profile?.image_url) {
                    const imgUrl = data.profile.image_url;
                    setPreviewUrl(imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}${imgUrl}`);
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setShowFileError(true);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setUserData({ ...userData, image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();

        formData.append('nombre', userData.first_name);
        if (userData.image instanceof File) {
            formData.append('image', userData.image);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/perfil/actualizar/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Perfil actualizado. Cerrando sesión para aplicar cambios...' });

                setTimeout(() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('usuario');
                    window.location.href = '/login';
                }, 2000);
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar perfil.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/perfil/password/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_password: passwordData.old_password,
                    new_password: passwordData.new_password
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
                setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <User className="text-cyan-500 w-5 h-5" /> Configuración de Perfil
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                        {/* AVATAR SECTION */}
                        <div className="md:col-span-4 flex flex-col items-center">
                            <div className="relative w-32 h-32 group">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-800 shadow-xl bg-slate-800 flex items-center justify-center relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-slate-600" />
                                    )}
                                    <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={() => !isLocked && fileInputRef.current.click()}>
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isLocked && fileInputRef.current.click()}
                                    disabled={isLocked}
                                    className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg border-4 border-slate-900 transition-all ${isLocked
                                        ? 'bg-slate-800 text-slate-600 scale-90'
                                        : 'bg-cyan-500 text-slate-950 hover:scale-110'
                                        }`}
                                >
                                    <Upload className="w-3 h-3" />
                                </button>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                            <div className="mt-4 text-center">
                                <p className="text-white font-bold">@{userData.username.split('@')[0]}</p>
                                <p className="text-slate-500 text-xs">{userData.email}</p>
                            </div>
                        </div>

                        {/* FORM SECTION */}
                        <div className="md:col-span-8 space-y-6">
                            {/* Info Personal */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3 h-3" /> Información Personal
                                </h4>
                                <div className="space-y-1 text-left">
                                    <label className="text-xs text-slate-400 ml-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={userData.first_name}
                                        onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                                        placeholder="Tu nombre completo"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all font-medium"
                                    />
                                </div>
                                {isLocked && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-amber-500 font-bold text-xs">Actualización Bloqueada</p>
                                            <p className="text-amber-500/70 text-[10px] leading-tight mt-1">{lockMessage}</p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={loading || isLocked}
                                    className={`w-full font-bold py-3 rounded-xl transition-all border flex items-center justify-center gap-2 ${isLocked
                                        ? 'bg-slate-800/50 text-slate-500 border-slate-700 cursor-not-allowed'
                                        : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                                        }`}
                                >
                                    <Save className="w-4 h-4" /> {isLocked ? 'Cambios Bloqueados' : 'Guardar Cambios'}
                                </button>
                            </div>

                            {/* Seguridad */}
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> Seguridad
                                    </h4>
                                    <button
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="text-cyan-500 text-xs font-bold hover:underline"
                                    >
                                        {showPasswords ? 'Cancelar Cambio' : 'Cambiar Contraseña'}
                                    </button>
                                </div>

                                {showPasswords ? (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        <div className="space-y-1 text-left">
                                            <label className="text-xs text-slate-400 ml-1">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                value={passwordData.old_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1 text-left">
                                                <label className="text-xs text-slate-400 ml-1">Nueva</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1 text-left">
                                                <label className="text-xs text-slate-400 ml-1">Confirmar</label>
                                                <input
                                                    type="password"
                                                    value={passwordData.confirm_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={loading}
                                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                                        >
                                            Actualizar Contraseña
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full bg-slate-800/50 border border-slate-800/50 rounded-xl p-3 text-slate-500 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Key className="w-4 h-4" />
                                            <span className="tracking-widest">••••••••</span>
                                        </div>
                                        <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Error de Archivo */}
            {showFileError && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl border-t-4 border-t-red-500 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-white">Formato no soportado</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    El archivo que intentas subir no es válido. Por favor, selecciona una imagen en formato <span className="text-white font-bold">PNG</span> o <span className="text-white font-bold">JPG/JPEG</span>.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFileError(false)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileModal;
