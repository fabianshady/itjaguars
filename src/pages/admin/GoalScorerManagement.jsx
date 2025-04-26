import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { Box, Typography, Paper, TextField, Button, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';

function GoalScorerManagement() {
    const [jugadores, setJugadores] = useState([]);
    const [selectedJugadorId, setSelectedJugadorId] = useState('');
    const [goles, setGoles] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const jugadoresCollectionRef = collection(db, 'jugadores');

    const fetchJugadores = async () => {
        setLoading(true);
        setError(null);
        try {
            const q = query(jugadoresCollectionRef, where('activo', '!=', false), orderBy('nombre', 'asc'));
            const data = await getDocs(q);
            setJugadores(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        } catch (err) {
            console.error("Error fetching jugadores:", err);
            setError("Error al cargar jugadores.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJugadores(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numGoles = parseInt(goles, 10);
        if (!selectedJugadorId || isNaN(numGoles) || numGoles < 0) {
            alert("Jugador y número de goles (válido) son requeridos.");
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            const jugadorDocRef = doc(db, 'jugadores', selectedJugadorId);
            const jugadorSnap = await getDocs(query(jugadoresCollectionRef, where('__name__', '==', selectedJugadorId)));
            const jugadorData = jugadorSnap.docs[0]?.data();
            const golesPrevios = jugadorData?.goles ?? 0;

            await updateDoc(jugadorDocRef, {
                goles: numGoles,
                golesPrevios: golesPrevios,
            });

            setSelectedJugadorId('');
            setGoles('');
            await fetchJugadores();
        } catch (err) {
            console.error("Error saving goles:", err);
            setError("Error al guardar goles.");
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
                ⚽ Gestión de Goleo
            </Typography>

            {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mb: 4, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
                <TextField
                    select
                    label="Seleccionar Jugador"
                    value={selectedJugadorId}
                    onChange={(e) => setSelectedJugadorId(e.target.value)}
                    required
                    disabled={submitting}
                >
                    {jugadores.map((jugador) => (
                        <MenuItem key={jugador.id} value={jugador.id}>
                            {jugador.nombre}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Goles"
                    type="number"
                    value={goles}
                    onChange={(e) => setGoles(e.target.value)}
                    required
                    inputProps={{ min: 0 }}
                    disabled={submitting}
                />

                <Box sx={{ gridColumn: { xs: '1', md: 'span 2' }, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                        {submitting ? 'Guardando...' : 'Añadir/Actualizar Goles'}
                    </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ gridColumn: { md: 'span 2' } }}>
                    Actualiza los goles directamente en el registro del jugador.
                </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
                Ranking Actual
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : jugadores.length === 0 ? (
                <Typography variant="body2">No hay jugadores registrados.</Typography>
            ) : (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Jugador</TableCell>
                                <TableCell>Goles</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jugadores
                                .filter(j => j.goles !== undefined)
                                .sort((a, b) => (b.goles || 0) - (a.goles || 0))
                                .map((j) => (
                                    <TableRow key={j.id}>
                                        <TableCell>{j.nombre}</TableCell>
                                        <TableCell>{j.goles ?? 0}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Paper>
    );
}

export default GoalScorerManagement;
