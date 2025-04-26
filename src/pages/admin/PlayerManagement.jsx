import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where
} from 'firebase/firestore';
import {
  Box, Paper, Typography, Button, Chip, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem, Stack, CircularProgress
} from '@mui/material';
import Select from 'react-select';

function PlayerManagement() {
  const [jugadores, setJugadores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [dorsal, setDorsal] = useState('');
  const [posiciones, setPosiciones] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const jugadoresCollectionRef = collection(db, 'jugadores');

  const opcionesPosiciones = [
    { value: 'Portero', label: 'Portero' },
    { value: 'Defensa', label: 'Defensa' },
    { value: 'Medio', label: 'Medio' },
    { value: 'Extremo', label: 'Extremo' },
    { value: 'Delantero', label: 'Delantero' },
  ];

  const fetchJugadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(jugadoresCollectionRef, orderBy('nombre', 'asc'));
      const data = await getDocs(q);
      setJugadores(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching jugadores:", err);
      setError("Error al cargar jugadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("El nombre es requerido.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const nombreTrimmed = nombre.trim();
    const posicionesArray = posiciones.map(p => p.value);

    try {
      const q = query(jugadoresCollectionRef, where("nombre", "==", nombreTrimmed));
      const existing = await getDocs(q);

      if (editingId) {
        if (!existing.empty && existing.docs[0].id !== editingId) {
          throw new Error(`El jugador "${nombreTrimmed}" ya existe.`);
        }

        const jugadorDoc = doc(db, 'jugadores', editingId);
        await updateDoc(jugadorDoc, {
          nombre: nombreTrimmed,
          dorsal: parseInt(dorsal, 10) || null,
          posiciones: posicionesArray
        });

      } else {
        if (!existing.empty) {
          throw new Error(`El jugador "${nombreTrimmed}" ya existe.`);
        }

        await addDoc(jugadoresCollectionRef, {
          nombre: nombreTrimmed,
          dorsal: parseInt(dorsal, 10) || null,
          posiciones: posicionesArray,
          activo: true
        });
      }

      setNombre('');
      setDorsal('');
      setPosiciones([]);
      setEditingId(null);
      await fetchJugadores();

    } catch (err) {
      console.error("Error saving jugador:", err);
      setError(err.message || "Error al guardar jugador.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (jugador) => {
    setEditingId(jugador.id);
    setNombre(jugador.nombre);
    setDorsal(jugador.dorsal || '');
    setPosiciones((jugador.posiciones || []).map(p => ({ value: p, label: p })));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setDorsal('');
    setPosiciones([]);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este jugador? Esto NO eliminará su historial de pagos/deudas, pero podría dificultar su visualización.")) return;
    setError(null);
    try {
      await deleteDoc(doc(db, 'jugadores', id));
      await fetchJugadores();
    } catch (err) {
      console.error("Error deleting jugador:", err);
      setError("Error al eliminar.");
    }
  };

  const toggleActivo = async (jugador) => {
    setError(null);
    try {
      const jugadorDoc = doc(db, 'jugadores', jugador.id);
      await updateDoc(jugadorDoc, { activo: !jugador.activo });
      await fetchJugadores();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Error al actualizar estado.");
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Gestión de Jugadores</Typography>
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2} direction="row" useFlexGap flexWrap="wrap">
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            size="small"
          />
          <TextField
            label="Dorsal"
            value={dorsal}
            onChange={(e) => setDorsal(e.target.value)}
            size="small"
            type="number"
            sx={{ width: 100 }}
          />
          <Box sx={{ minWidth: 240 }}>
            <Typography variant="caption">Posiciones</Typography>
            <Select
              isMulti
              value={posiciones}
              onChange={setPosiciones}
              options={opcionesPosiciones}
              isDisabled={submitting}
              placeholder="Seleccionar..."
            />
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Añadir')}
            </Button>
            {editingId && (
              <Button variant="outlined" onClick={cancelEdit} disabled={submitting}>
                Cancelar
              </Button>
            )}
          </Stack>
        </Stack>
      </form>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Jugadores Registrados</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
        ) : jugadores.length === 0 ? (
          <Typography>No hay jugadores registrados.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Dorsal</TableCell>
                <TableCell>Posiciones</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jugadores.map((j) => (
                <TableRow key={j.id} sx={!j.activo ? { backgroundColor: '#f0f0f0', color: '#999' } : {}}>
                  <TableCell>{j.nombre}</TableCell>
                  <TableCell>{j.dorsal || '-'}</TableCell>
                  <TableCell>{(j.posiciones || []).join(', ') || '-'}</TableCell>
                  <TableCell>{j.activo === false ? 'Inactivo' : 'Activo'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => handleEdit(j)} disabled={!j.activo && !editingId}>Editar</Button>
                      <Button size="small" variant="contained" color={j.activo === false ? 'primary' : 'warning'} onClick={() => toggleActivo(j)}>
                        {j.activo === false ? 'Activar' : 'Desactivar'}
                      </Button>
                      <Button size="small" variant="contained" color="error" onClick={() => handleDelete(j.id)}>
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Paper>
  );
}

export default PlayerManagement;
