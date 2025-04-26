import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button'; // Asegúrate de importar tu componente Button

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, currentUser, error, loading } = useAuth(); // Obtén el error del contexto
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado local para el botón
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (currentUser) {
      // Redirige a /admin o a la página desde la que vino (si existe)
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location.state]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Evita doble submit

    setIsSubmitting(true);
    try {
      await login(email, password);
      // La redirección se maneja en el useEffect al cambiar currentUser
    } catch (err) {
       // El error ya se maneja y se almacena en el contexto `useAuth`
       console.error("Error en handleSubmit:", err) // Log adicional si es necesario
    } finally {
       setIsSubmitting(false); // Reactiva el botón
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Ajusta min-h si tienes header/footer */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>} {/* Muestra el error de login */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="tu@email.com"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="********"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={isSubmitting || loading} // Deshabilita mientras carga auth o se envía
            >
              {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;