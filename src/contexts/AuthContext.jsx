import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Para manejar errores de login

  const login = async (email, password) => {
    setError(null); // Limpia errores anteriores
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El estado currentUser se actualizará por onAuthStateChanged
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err.message); // Guarda el mensaje de error
      // Podrías mapear códigos de error a mensajes más amigables aquí
      // e.g., if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta');
    }
  };

  const logout = () => {
    setError(null);
    return signOut(auth);
  };

  useEffect(() => {
    // Escucha cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Termina la carga una vez que se sabe el estado
    });

    // Limpia el listener al desmontar el componente
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error, // Expone el error
    login,
    logout,
  };

  // No renderiza nada hasta que se determine el estado inicial de auth
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};