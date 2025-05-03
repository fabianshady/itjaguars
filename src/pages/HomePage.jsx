import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import StandingsTabs from '../components/StandingsTabs';
import GoalScorersCard from '../components/GoalScorersCard';
import DebtSummaryCard from '../components/DebtSummaryCard';
import MatchesTabs from '../components/MatchesTabs';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const secciones = ['Tabla General', 'Tabla de Goleo', 'Estado de Cuentas'];
const fotos = [
    '/team.png',
    '/foto2.jpg',
    '/img_equipo_3.jpg',
    '/img_equipo_4.jpg'
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
        <Box sx={{ p: { xs: 2, md: 4 }, background: 'linear-gradient(to bottom right, #e3f2fd, #f0fdf4)', minHeight: '100vh' }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <img src="/logo.png" alt="Logo ITJ" style={{ height: 40 }} />
                    <Typography variant="h5" fontWeight="bold">ITJ FC</Typography>
                </Box>
                <Tabs
                    value={tabSeleccionado}
                    onChange={(_, val) => setTabSeleccionado(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                >
                    {secciones.map((nombre, i) => (
                        <Tab key={i} label={nombre} />
                    ))}
                </Tabs>
            </Box>

            {/* TARJETA DE PARTIDOS EXPANDIDA */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, mb: 6, maxWidth: 1000, mx: 'auto' }}>
                

                <Box mt={3}>
                <MatchesTabs partidos={partidos} fotoActual={fotoActual} setFotoActual={setFotoActual} fotos={fotos} />
                </Box>

                
            </Paper>

            {/* SECCIÓN DINÁMICA */}
            <Box>
                {tabSeleccionado === 0 && <StandingsTabs />}
                {tabSeleccionado === 1 && <GoalScorersCard goleo={goleo} />}
                {tabSeleccionado === 2 && <DebtSummaryCard jugadores={jugadores} eventos={eventos} asistencias={asistencias} />}
            </Box>
        </Box>
    );
}

export default HomePage;
