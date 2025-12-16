import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase no está configurado. Por favor agrega las variables de entorno.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (password.length < minLength) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        setLoading(false);
        return;
      }
      if (!hasUpperCase) {
        setError("La contraseña debe tener al menos una letra mayúscula.");
        setLoading(false);
        return;
      }
      if (!hasLowerCase) {
        setError("La contraseña debe tener al menos una letra minúscula.");
        setLoading(false);
        return;
      }
      if (!hasNumbers) {
        setError("La contraseña debe tener al menos un número.");
        setLoading(false);
        return;
      }
      if (!hasSpecialChar) {
        setError("La contraseña debe tener al menos un carácter especial (!@#$%^&*).");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Handle session duration
        if (!rememberMe) {
          // Set expiry to 24 hours from now
          const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem('session_expiry', expiryTime.toString());
        } else {
          // Clear any existing expiry for "Remember Me"
          localStorage.removeItem('session_expiry');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-neutral-950 p-4">
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-neutral-800 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-slate-500 dark:text-neutral-400">
            {isSignUp ? 'Guarda tus finanzas en la nube' : 'Accede a tus datos desde cualquier lugar'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              required
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-neutral-400 cursor-pointer select-none">
                Recuérdame
              </label>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isSignUp ? (
              <>
                <UserPlus size={20} /> Registrarse
              </>
            ) : (
              <>
                <LogIn size={20} /> Entrar
              </>
            )}
          </button>
        </form>

        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => {
              setEmail('dev@admin.com');
              setPassword('Dev12345!');
            }}
            className="mt-4 w-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 p-3 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors border border-dashed border-slate-300 dark:border-neutral-700 flex items-center justify-center gap-2"
          >
            ⚡ Rellenar Usuario Dev
          </button>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}