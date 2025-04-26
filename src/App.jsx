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
              bgcolor: theme.palette.primary.main,
              color: '#ffffff',
              py: 2,
              fontWeight: 'medium',
              fontSize: '0.9rem',
              borderTop: `3px solid ${theme.palette.secondary.main}`,
            }}
          >
            <Typography variant="body2">
              ITJ FC — {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Router>
    </AuthProvider>
    
  );
}

export default App;
