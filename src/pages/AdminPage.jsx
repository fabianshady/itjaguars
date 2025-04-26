import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  Button as MuiButton,
  Container,
  Box,
  Paper
} from '@mui/material';
import DebtTrackingGrid from './admin/DebtTrackingGrid';
import PlayerManagement from './admin/PlayerManagement';
import EventManagement from './admin/EventManagement';
import MatchManagement from './admin/MatchManagement';
import GoalScorerManagement from './admin/GoalScorerManagement';
import LeagueTableManagement from './admin/LeagueTableManagement';

function AdminPage() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pagosGrid');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Hubo un problema al cerrar sesión.');
    }
  };

  const tabs = [
    { id: 'pagosGrid', label: '💸 Pagos/Deudas', component: <DebtTrackingGrid /> },
    { id: 'jugadores', label: '👤 Jugadores', component: <PlayerManagement /> },
    { id: 'eventos', label: '🏷️ Eventos (Cargos)', component: <EventManagement /> },
    { id: 'partidos', label: '🗓️ Partidos', component: <MatchManagement /> },
    { id: 'goleo', label: '⚽ Goleo', component: <GoalScorerManagement /> },
    { id: 'tabla', label: '🏆 Tabla General', component: <LeagueTableManagement /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f0fdf4, #e3f2fd)',
      }}
    >
      <AppBar
        position="static"
        elevation={3}
        sx={{
          background: 'linear-gradient(90deg, #2e7d32 0%, #1976d2 100%)',
          color: '#fff',
          width: '100%',
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Avatar
            src="/ITJ - white no slogan.png"
            alt="ITJ Logo"
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Football Club
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Panel de Administración
              </Typography>
              {currentUser && (
                <Typography variant="body2" color="text.secondary">
                  Logueado como: {currentUser.email}
                </Typography>
              )}
            </Box>
            <MuiButton variant="contained" color="secondary" onClick={handleLogout}>
              Cerrar Sesión
            </MuiButton>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            {tabs.map((tab) => (
              <MuiButton
                key={tab.id}
                variant={activeTab === tab.id ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(tab.id)}
                color="primary"
              >
                {tab.label}
              </MuiButton>
            ))}
          </Box>
        </Paper>

        <Box>
          {tabs.find(tab => tab.id === activeTab)?.component}
        </Box>
      </Container>
    </Box>
  );
}

export default AdminPage;
