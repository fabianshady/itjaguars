import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, updateDoc
} from 'firebase/firestore';
import {
  Box, Button, Chip, Grid, Paper, Stack, TextField, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import LoadingSpinner from '../../components/LoadingSpinner';

function MatchManagement() {
  const [partidos, setPartidos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [lugar, setLugar] = useState('');
  const [rival, setRival] = useState('');
  const [convocados, setConvocados] = useState([]);
  const [marcador, setMarcador] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editandoConvocadosId, setEditandoConvocadosId] = useState(null);
  const [convocadosEditTemp, setConvocadosEditTemp] = useState([]);


  const partidosCollectionRef = collection(db, 'partidos');
  const jugadoresCollectionRef = collection(db, 'jugadores');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const partidosSnap = await getDocs(query(partidosCollectionRef, orderBy('fecha', 'desc')));
        setPartidos(partidosSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

        const jugadoresSnap = await getDocs(query(jugadoresCollectionRef, orderBy('nombre', 'asc')));
        setJugadores(jugadoresSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPartido = async (e) => {
    e.preventDefault();
    if (!fecha || !hora || !lugar || !rival) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await addDoc(partidosCollectionRef, {
        fecha: fecha.toISOString(),
        hora: hora.format('HH:mm'),
        lugar,
        rival,
        convocados,
        marcador: '',
      });

      setFecha(null);
      setHora(null);
      setLugar('');
      setRival('');
      setConvocados([]);
      setMarcador('');

      const partidosSnap = await getDocs(query(partidosCollectionRef, orderBy('fecha', 'desc')));
      setPartidos(partidosSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error añadiendo partido:", err);
      setError("No se pudo añadir el partido.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePartido = async (id) => {
    if (!window.confirm("¿Eliminar este partido?")) return;
    try {
      await deleteDoc(doc(db, 'partidos', id));
      setPartidos(partidos.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el partido.");
    }
  };

  const handleUpdateMarcador = async (id, marcador) => {
    try {
      const ref = doc(db, 'partidos', id);
      await updateDoc(ref, { marcador });
      setPartidos(partidos.map(p => p.id === id ? { ...p, marcador } : p));
    } catch (err) {
      console.error("Error actualizando marcador:", err);
      alert("No se pudo actualizar el marcador.");
    }
  };

  const groupedJugadores = jugadores.reduce((acc, jugador) => {
    (jugador.posiciones || []).forEach(pos => {
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(jugador);
    });
    return acc;
  }, {});

  const toggleConvocado = (nombre) => {
    setConvocados(prev =>
      prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
    );
  };

  const handleUpdateConvocados = async (id, nuevosConvocados) => {
    try {
      const ref = doc(db, 'partidos', id);
      await updateDoc(ref, { convocados: nuevosConvocados });
      setPartidos(partidos.map(p =>
        p.id === id ? { ...p, convocados: nuevosConvocados } : p
      ));
      setEditandoConvocadosId(null);
    } catch (err) {
      console.error("Error actualizando convocados:", err);
      alert("No se pudo actualizar la lista de convocados.");
    }
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="space-y-6">
        <Typography variant="h5" color="primary">Gestión de Partidos</Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleAddPartido} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><DatePicker label="Fecha" value={fecha} onChange={setFecha} fullWidth /></Grid>
              <Grid item xs={12} md={6}><TimePicker label="Hora" value={hora} onChange={setHora} fullWidth /></Grid>
              <Grid item xs={12} md={6}><TextField label="Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} fullWidth required /></Grid>
              <Grid item xs={12} md={6}><TextField label="Rival" value={rival} onChange={(e) => setRival(e.target.value)} fullWidth required /></Grid>
            </Grid>

            <Typography variant="subtitle1">Convocados por Posición</Typography>
            <Stack spacing={2}>
              {Object.entries(groupedJugadores).map(([pos, jugadores]) => (
                <Box key={pos}>
                  <Typography variant="caption" color="textSecondary">{pos}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {jugadores.map(j => (
                      <Chip
                        key={j.id}
                        label={j.nombre}
                        clickable
                        color={convocados.includes(j.nombre) ? 'primary' : 'default'}
                        onClick={() => toggleConvocado(j.nombre)}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>

            <Typography variant="body2" color="textSecondary">Convocados seleccionados ({convocados.length}): {convocados.join(', ')}</Typography>

            <Button type="submit" variant="contained" disabled={submitting} sx={{ mt: 2 }}>
              {submitting ? 'Añadiendo...' : 'Añadir Partido'}
            </Button>
          </form>
        </Paper>

        <Typography variant="h5" color="primary" gutterBottom>Partidos Registrados</Typography>
        {loading ? <LoadingSpinner /> : (
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Lugar</TableCell>
                  <TableCell>Rival</TableCell>
                  <TableCell>Convocados</TableCell>
                  <TableCell>Marcador</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partidos.map(partido => (
                  <TableRow key={partido.id} hover>
                    <TableCell>{partido.fecha}</TableCell>
                    <TableCell>{partido.hora}</TableCell>
                    <TableCell>{partido.lugar}</TableCell>
                    <TableCell>{partido.rival}</TableCell>
                    <TableCell>
                      {editandoConvocadosId === partido.id ? (
                        <>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            {jugadores.map(j => (
                              <Chip
                                key={j.id}
                                label={j.nombre}
                                clickable
                                color={convocadosEditTemp.includes(j.nombre) ? 'primary' : 'default'}
                                onClick={() =>
                                  setConvocadosEditTemp(prev =>
                                    prev.includes(j.nombre)
                                      ? prev.filter(n => n !== j.nombre)
                                      : [...prev, j.nombre]
                                  )
                                }
                              />
                            ))}
                          </Box>
                          <Button
                            onClick={() => handleUpdateConvocados(partido.id, convocadosEditTemp)}
                            size="small"
                            variant="contained"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={() => setEditandoConvocadosId(null)}
                            size="small"
                            variant="text"
                            sx={{ ml: 1 }}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Box>
                          <Typography variant="caption">
                            {partido.convocados?.join(', ')}
                          </Typography>
                          <Button
                            onClick={() => {
                              setEditandoConvocadosId(partido.id);
                              setConvocadosEditTemp(partido.convocados || []);
                            }}
                            size="small"
                            variant="text"
                          >
                            Editar
                          </Button>
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      {partido.marcador
                        ? <span>{partido.marcador}</span>
                        : (
                          <TextField
                            variant="standard"
                            size="small"
                            placeholder="Ej. 4-2"
                            onBlur={(e) => handleUpdateMarcador(partido.id, e.target.value)}
                          />
                        )}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleDeletePartido(partido.id)} variant="outlined" color="error" size="small">
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </LocalizationProvider>
  );
}

export default MatchManagement;
