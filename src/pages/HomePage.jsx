import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import {
  CircularProgress,
  Container,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Grid,
  Fade,
} from '@mui/material';
import MatchesTabs from '../components/MatchesTabs';
import StandingsTabs from '../components/StandingsTabs';
import GoalScorersCard from '../components/GoalScorersCard';
import DebtSummaryCard from '../components/DebtSummaryCard';
import PhotosSection from '../components/PhotosSection';
import PhotosSection2 from '../components/PhotosSection2';

function HomePage() {
  const [partidos, setPartidos] = useState([]);
  const [tablaGeneral, setTablaGeneral] = useState([]);
  const [goleo, setGoleo] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const partidosQuery = query(collection(db, 'partidos'), orderBy('fecha', 'asc'), limit(5));
        const tablaQuery = query(collection(db, 'tablaGeneral'), orderBy('puntos', 'desc'));
        const goleoQuery = query(collection(db, 'goleo'), orderBy('goles', 'desc'));
        const jugadoresQuery = query(collection(db, 'jugadores'), where('activo', '!=', false), orderBy('nombre', 'asc'));
        const eventosQuery = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
        const asistenciasQuery = collection(db, 'asistenciaPagos');

        const [
          partidosSnapshot,
          tablaSnapshot,
          goleoSnapshot,
          jugadoresSnapshot,
          eventosSnapshot,
          asistenciasSnapshot
        ] = await Promise.all([
          getDocs(partidosQuery),
          getDocs(tablaQuery),
          getDocs(goleoQuery),
          getDocs(jugadoresQuery),
          getDocs(eventosQuery),
          getDocs(asistenciasQuery)
        ]);

        setPartidos(partidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setTablaGeneral(tablaSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setGoleo(goleoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setJugadores(jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const asistenciasMap = {};
        asistenciasSnapshot.forEach(doc => {
          const data = doc.data();
          const key = `${data.jugadorId}_${data.eventoId}`;
          asistenciasMap[key] = { ...data, id: doc.id };
        });
        setAsistencias(asistenciasMap);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No se pudo cargar la información. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #e3f2fd, #f0fdf4)',
      }}
    >

      {/* Nuevo Banner Principal */}
      <Fade in timeout={1000}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: { xs: 4, md: 6 },
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #ffffff 100%)', // Azul marino a blanco suave
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="ITJaguars FC Logo"
            sx={{
              width: { xs: 160, md: 240 },
              height: 'auto',
              mb: 2,
              filter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.3))', // Sombra para resaltar el logo
            }}
          />
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontWeight: 'bold',
              color: '#dde9f5',
              textAlign: 'center',
              px: 2,
            }}
          >
            ITJaguars FC - Temporada 2025
          </Typography>
        </Box>

      </Fade>


      {/* Contenido principal */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <MatchesTabs partidos={partidos} />
            <PhotosSection />
          </Grid>
          <Grid item xs={12} md={4}>
            <StandingsTabs />
          </Grid>
          <Grid item xs={12} md={4}>
            <GoalScorersCard goleo={goleo} />
            <PhotosSection2 />
          </Grid>
          <Grid item xs={12}>
            <DebtSummaryCard jugadores={jugadores} eventos={eventos} asistencias={asistencias} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
