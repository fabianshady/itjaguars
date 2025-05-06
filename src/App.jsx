import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import LoadingSpinner from './components/LoadingSpinner';
import { CssBaseline, Box, Typography, useTheme } from '@mui/material';
import theme from './theme';
import { Analytics } from "@vercel/analytics/react"


function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const theme = useTheme();

  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Analytics />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>

          <Box
            component="footer"
            sx={{
              textAlign: 'center',
              background: 'linear-gradient(to right, #1e3c72, #2a5298)', // Azul deportivo elegante
              color: '#ffffff',
              py: 3,
              px: 2,
              borderTop: `4px solid ${theme.palette.secondary.main}`,
              mt: 'auto',
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <Box component="img" src="/logo.png" alt="Logo ITJ" sx={{ height: 40 }} />

              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                © {new Date().getFullYear()} ITJAGUARS FC — Todos los derechos reservados
              </Typography>

              {/* Enlaces opcionales o redes sociales */}
              {/* <Box display="flex" gap={2} mt={1}>
      <Link href="#" underline="hover" color="inherit">Instagram</Link>
      <Link href="#" underline="hover" color="inherit">Contacto</Link>
    </Box> */}
            </Box>
          </Box>

        </Box>
      </Router>
    </AuthProvider>

  );
}

export default App;
