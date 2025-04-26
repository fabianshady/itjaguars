import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../firebase/config';
import {
    collection, getDocs, doc, setDoc, query, where, orderBy
} from 'firebase/firestore';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, CircularProgress } from '@mui/material';

const STATUS_OPTIONS = ["Pendiente", "Pagado", "Ausente"];
const STATUS_DISPLAY = {
    "Pagado": { icon: '✓', color: '#2e7d32', bgColor: '#e8f5e9', next: 'Ausente' },
    "Pendiente": { icon: 'X', color: '#c62828', bgColor: '#ffebee', next: 'Pagado' },
    "Ausente": { icon: '-', color: '#616161', bgColor: '#f5f5f5', next: 'Pendiente' }
};

function DebtTrackingGrid() {
    const [jugadores, setJugadores] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [asistencias, setAsistencias] = useState({});
    const [loading, setLoading] = useState(true);
    const [updatingCell, setUpdatingCell] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const qJugadores = query(collection(db, 'jugadores'), where('activo', '!=', false), orderBy('nombre', 'asc'));
            const jugadoresSnap = await getDocs(qJugadores);
            const jugadoresData = jugadoresSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setJugadores(jugadoresData);

            const qEventos = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
            const eventosSnap = await getDocs(qEventos);
            const eventosData = eventosSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setEventos(eventosData);

            const asistenciasSnap = await getDocs(collection(db, 'asistenciaPagos'));
            const asistenciasMap = {};
            asistenciasSnap.forEach(doc => {
                const data = doc.data();
                const key = `${data.jugadorId}_${data.eventoId}`;
                asistenciasMap[key] = { ...data, id: doc.id };
            });
            setAsistencias(asistenciasMap);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error al cargar los datos de la tabla. Intenta recargar.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const deudas = useMemo(() => {
        const calculatedDeudas = {};
        jugadores.forEach(j => {
            let deudaTotal = 0;
            eventos.forEach(e => {
                const key = `${j.id}_${e.id}`;
                const asistencia = asistencias[key];
                if (asistencia && asistencia.estado === 'Pendiente') {
                    deudaTotal += asistencia.costoAplicado ?? e.costo ?? 0;
                }
            });
            calculatedDeudas[j.id] = deudaTotal;
        });
        return calculatedDeudas;
    }, [jugadores, eventos, asistencias]);

    const handleCellClick = async (jugadorId, evento) => {
        const eventoId = evento.id;
        const key = `${jugadorId}_${eventoId}`;
        if (updatingCell === key) return;

        setUpdatingCell(key);
        setError(null);

        const currentAsistencia = asistencias[key];
        const currentState = currentAsistencia?.estado || 'Ausente';
        const nextState = STATUS_DISPLAY[currentState]?.next || STATUS_OPTIONS[0];

        try {
            const docRef = doc(collection(db, 'asistenciaPagos'), currentAsistencia?.id || `${jugadorId}_${eventoId}_${Date.now()}`);

            const dataToSet = {
                jugadorId,
                eventoId,
                estado: nextState,
                costoAplicado: evento.costo,
            };

            await setDoc(docRef, dataToSet, { merge: true });

            setAsistencias(prev => ({
                ...prev,
                [key]: { ...dataToSet, id: docRef.id }
            }));
        } catch (err) {
            console.error(`Error updating status for ${key}:`, err);
            setError(`Error al actualizar estado para jugador.`);
        } finally {
            setUpdatingCell(null);
        }
    };

    const renderStatusCell = (jugadorId, evento) => {
        const key = `${jugadorId}_${evento.id}`;
        const asistencia = asistencias[key];
        const status = asistencia?.estado || 'Ausente';
        const display = STATUS_DISPLAY[status];

        return (
            <TableCell
                key={key}
                align="center"
                sx={{
                    backgroundColor: display.bgColor,
                    color: display.color,
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
                onClick={() => handleCellClick(jugadorId, evento)}
                title={`Clic para cambiar estado (${status} -> ${display.next})`}
            >
                {updatingCell === key ? (
                    <CircularProgress size={16} thickness={4} />
                ) : (
                    display.icon
                )}
            </TableCell>
        );
    };

    if (loading) return <CircularProgress sx={{ mt: 4 }} />;
    if (error) return <Typography color="error" align="center">{error}</Typography>;

    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
                💸 Tabla de Pagos y Deudas
            </Typography>
            <Button variant="contained" color="secondary" onClick={fetchData} sx={{ mb: 2 }}>
                Recargar Datos
            </Button>
            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Jugador</TableCell>
                            <TableCell>Total Deuda</TableCell>
                            {eventos.map(e => (
                                <TableCell
                                    key={e.id}
                                    align="center"
                                    sx={{ whiteSpace: 'nowrap', fontSize: '0.7rem' }}
                                    title={`$${e.costo.toFixed(2)} - ${e.fecha.toDate().toLocaleDateString()}`}
                                >
                                    {e.nombre}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jugadores.map(j => (
                            <TableRow key={j.id}>
                                <TableCell>{j.nombre}</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: deudas[j.id] > 0 ? '#c62828' : '#2e7d32' }}>
                                    ${(deudas[j.id] || 0).toFixed(2)}
                                </TableCell>
                                {eventos.map(e => renderStatusCell(j.id, e))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            <Typography variant="caption" color="text.secondary" mt={2}>
                Haz clic en ✓, X o - para cambiar el estado de pago del jugador para ese evento.
            </Typography>
        </Paper>
    );
}

export default DebtTrackingGrid;
