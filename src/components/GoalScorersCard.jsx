import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { ArrowDropUp, ArrowDropDown, Remove } from '@mui/icons-material';

function GoalScorersCard() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJugadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const jugadoresRef = collection(db, 'jugadores');
      const q = query(jugadoresRef, where('activo', '!=', false), orderBy('goles', 'desc'));
      const data = await getDocs(q);
      setJugadores(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error al cargar jugadores:", err);
      setError("No se pudo cargar la tabla de goleo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJugadores(); }, []);

  const getPositionDelta = (jugador) => {
    if (jugador.golesPrevios === undefined) return null;
    const currentGoals = jugador.goles ?? 0;
    const previousGoals = jugador.golesPrevios ?? 0;
    const delta = currentGoals - previousGoals;
    if (delta > 0) return <ArrowDropUp fontSize="small" color="success" />;
    if (delta < 0) return <ArrowDropDown fontSize="small" color="error" />;
    return <Remove fontSize="small" color="disabled" />;
  };

  return (
    <Paper elevation={3} sx={{ background: 'linear-gradient(to bottom right, #ffe29f, #ffa99f)', p: 4, borderRadius: 4, mb: 6, maxWidth: 600, mx: 'auto' }}>
      <Typography
        variant="h5"
        color="primary"
        gutterBottom
        fontWeight="bold"
        sx={{ textAlign: 'center', mb: 2 }}
      >
        Stats / Goals
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body2" color="error">{error}</Typography>
      ) : jugadores.length > 0 ? (
        <Box sx={{ width: { xs: '100%', md: 600 }, overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Player</TableCell>
                <TableCell>Goals</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jugadores.map((jugador, index) => (
                <TableRow key={jugador.id}>
                  {/* Ranking + flecha */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      
                      {getPositionDelta(jugador)}
                      <Typography ml={0.5}>{index + 1}</Typography>
                    </Box>
                  </TableCell>

                  {/* Nombre */}
                  <TableCell><Typography fontWeight="bold">{jugador.nombre}</Typography></TableCell>

                  {/* Goles */}
                  <TableCell><Typography fontWeight="bold">{jugador.goles ?? 0}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Typography variant="body2">La tabla de goleo aún no está disponible.</Typography>
      )}
    </Paper>
  );
}

export default GoalScorersCard;
