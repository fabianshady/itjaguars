import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Tabs, Tab, Paper, CircularProgress, Fade } from '@mui/material';
import StandingsTabs from '../components/StandingsTabs';
import GoalScorersCard from '../components/GoalScorersCard';
import DebtSummaryCard from '../components/DebtSummaryCard';
import MatchesTabs from '../components/MatchesTabs';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const secciones = ['Table', 'Stats / Goals', 'Accounting'];
const fotos = [
  'team.png',
  '/14.jpg',
  '/foto1.JPG',
  '/foto2.jpg',
  '/13.jpg',
  '/IMG_1838.JPG',
  '/d.jpg',
  '/11.jpg',
  '/12.jpg',
];

function HomePage() {
  const [tabSeleccionado, setTabSeleccionado] = useState(0);
  const [fotoActual, setFotoActual] = useState(0);

  const [partidos, setPartidos] = useState([]);
  const [tablaGeneral, setTablaGeneral] = useState([]);
  const [goleo, setGoleo] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tablaRef = useRef(null);
  const statsRef = useRef(null);
  const accountingRef = useRef(null);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const partidosQuery = query(collection(db, 'partidos'), orderBy('fecha', 'desc'), limit(6));
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
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      {/* HEADER */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#f5f7fa',
          pb: 2,
          pt: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ px: { xs: 2, md: 4 } }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <img src="/logo.png" alt="Logo ITJ" style={{ height: 70 }} />
            <Typography variant="h5" fontWeight="bold">ITJAGUARS FC</Typography>
          </Box>

          <Tabs
            value={tabSeleccionado}
            onChange={(_, val) => {
              setTabSeleccionado(val);

              // Scroll después de un corto delay (más que 50ms para dejar que Fade acabe)
              setTimeout(() => {
                const refs = [tablaRef, statsRef, accountingRef];
                const target = refs[val];
                if (target?.current) {
                  target.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300); // este tiempo debe empatar con tu Fade timeout
            }}


            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
          >
            {secciones.map((nombre, i) => (
              <Tab key={i} label={nombre} />
            ))}
          </Tabs>
        </Box>
      </Box>


      {/* TARJETA DE PARTIDOS EXPANDIDA */}
      <Paper elevation={3} sx={{ background: 'linear-gradient(to bottom right, #fceabb, #f8b500)', p: 4, borderRadius: 4, mb: 6, maxWidth: 1600, mx: 'auto' }}>
        <Box mt={3}>
          <MatchesTabs partidos={partidos} fotoActual={fotoActual} setFotoActual={setFotoActual} fotos={fotos} jugadoresRegistrados={jugadores} />
        </Box>
      </Paper>

      <Box>
        <Box ref={tablaRef}>
          {tabSeleccionado === 0 && (
            <Fade in={true} timeout={400} key="tabla">
              <Box>
                <StandingsTabs />
              </Box>
            </Fade>
          )}
        </Box>

        <Box ref={statsRef}>
          {tabSeleccionado === 1 && (
            <Fade in={true} timeout={400} key="stats">
              <Box>
                <GoalScorersCard goleo={goleo} />
              </Box>
            </Fade>
          )}
        </Box>

        <Box ref={accountingRef}>
          {tabSeleccionado === 2 && (
            <Fade in={true} timeout={400} key="accounting">
              <Box>
                <DebtSummaryCard jugadores={jugadores} eventos={eventos} asistencias={asistencias} />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>



    </Box>
  );
}

export default HomePage;
