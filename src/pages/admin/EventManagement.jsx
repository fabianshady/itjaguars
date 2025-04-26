import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Box, Typography, Paper, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';

function EventManagement() {
    const [eventos, setEventos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [costo, setCosto] = useState('');
    const [fecha, setFecha] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const eventosCollectionRef = collection(db, 'eventos');

    const fetchEventos = async () => {
        setLoading(true);
        setError(null);
        try {
            const q = query(eventosCollectionRef, orderBy('fecha', 'desc'));
            const data = await getDocs(q);
            setEventos(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        } catch (err) {
            console.error("Error fetching eventos:", err);
            setError("Error al cargar eventos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEventos(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const costoNum = parseFloat(costo);
        if (!nombre.trim() || isNaN(costoNum) || costoNum < 0 || !fecha) {
            alert("Nombre, Costo válido y Fecha son requeridos.");
            return;
        }
        setSubmitting(true);
        setError(null);

        const fechaTimestamp = Timestamp.fromDate(new Date(fecha + 'T00:00:00'));
        const eventoData = { nombre: nombre.trim(), costo: costoNum, fecha: fechaTimestamp };

        try {
            if (editingId) {
                await updateDoc(doc(db, 'eventos', editingId), eventoData);
            } else {
                await addDoc(eventosCollectionRef, eventoData);
            }
            setNombre(''); setCosto(''); setFecha(''); setEditingId(null);
            await fetchEventos();
        } catch (err) {
            console.error("Error saving evento:", err);
            setError("Error al guardar evento.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (evento) => {
        setEditingId(evento.id);
        setNombre(evento.nombre);
        setCosto(evento.costo.toString());
        setFecha(evento.fecha.toDate().toISOString().split('T')[0]);
    };

    const cancelEdit = () => {
        setEditingId(null); setNombre(''); setCosto(''); setFecha(''); setError(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este evento? Esto lo quitará de la tabla de deudas y puede afectar cálculos históricos.")) return;
        setError(null);
        try {
            await deleteDoc(doc(db, 'eventos', id));
            await fetchEventos();
        } catch (err) {
            console.error("Error deleting evento:", err);
            setError("Error al eliminar.");
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
                🏷️ Gestión de Eventos (Cargos)
            </Typography>

            {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mb: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
                <TextField
                    label="Nombre del Evento"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={submitting}
                />
                <TextField
                    label="Costo ($)"
                    type="number"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    disabled={submitting}
                />
                <TextField
                    label="Fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                    disabled={submitting}
                />
                <Box sx={{ gridColumn: { xs: '1', md: 'span 3' }, display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                        {submitting ? 'Guardando...' : (editingId ? 'Actualizar Evento' : 'Añadir Evento')}
                    </Button>
                    {editingId && (
                        <Button variant="outlined" onClick={cancelEdit} disabled={submitting}>
                            Cancelar Edición
                        </Button>
                    )}
                </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
                Eventos Registrados
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : eventos.length === 0 ? (
                <Typography variant="body2">No hay eventos registrados.</Typography>
            ) : (
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Costo</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {eventos.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell>{e.fecha.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell>{e.nombre}</TableCell>
                                    <TableCell>${e.costo.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button variant="outlined" size="small" onClick={() => handleEdit(e)} sx={{ mr: 1 }}>
                                            Editar
                                        </Button>
                                        <Button variant="contained" size="small" color="error" onClick={() => handleDelete(e.id)}>
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Paper>
    );
}

export default EventManagement;
