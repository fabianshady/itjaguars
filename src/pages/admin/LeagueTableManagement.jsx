import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { Box, Paper, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';

function LeagueTableManagement() {
  const [tabla, setTabla] = useState([]);
  const [equipo, setEquipo] = useState('');
  const [jj, setJj] = useState('');
  const [jg, setJg] = useState('');
  const [je, setJe] = useState('');
  const [jp, setJp] = useState('');
  const [gf, setGf] = useState('');
  const [gc, setGc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('ITJ FC');
  const [excelPreview, setExcelPreview] = useState([]);

  const tablaCollectionRef = collection(db, 'tablaGeneral');
  const tablaPrevioRef = collection(db, 'tablaGeneralPrevio');

  const calcularDiferencia = (gf, gc) => parseInt(gf, 10) - parseInt(gc, 10);
  const calcularPuntos = (jg, je) => (parseInt(jg, 10) * 3) + parseInt(je, 10);

  const fetchTabla = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(tablaCollectionRef, where("grupo", "==", grupoSeleccionado), orderBy('puntos', 'desc'));
      const data = await getDocs(q);
      setTabla(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching tabla:", err);
      setError("Error al cargar la tabla.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTabla(); }, [grupoSeleccionado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipo || isNaN(jj) || isNaN(jg) || isNaN(je) || isNaN(jp) || isNaN(gc) || isNaN(gf)) {
      alert("Todos los campos deben ser válidos.");
      return;
    }

    const dif = calcularDiferencia(gf, gc);
    const pts = calcularPuntos(jg, je);
    setSubmitting(true);
    setError(null);

    try {
      const data = {
        equipo: equipo.trim(),
        jj: parseInt(jj), jg: parseInt(jg), je: parseInt(je), jp: parseInt(jp),
        gf: parseInt(gf), gc: parseInt(gc), dif, puntos: pts, grupo: grupoSeleccionado
      };

      if (editingId) {
        await updateDoc(doc(db, 'tablaGeneral', editingId), data);
      } else {
        const q = query(tablaCollectionRef, where("equipo", "==", equipo.trim()), where("grupo", "==", grupoSeleccionado));
        const existing = await getDocs(q);
        if (!existing.empty) {
          await updateDoc(doc(db, 'tablaGeneral', existing.docs[0].id), data);
        } else {
          await addDoc(tablaCollectionRef, data);
        }
      }

      setEquipo(''); setJj(''); setJg(''); setJe(''); setJp(''); setGc(''); setGf(''); setEditingId(null);
      await fetchTabla();
    } catch (err) {
      console.error("Error saving equipo:", err);
      setError("Error al guardar equipo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEquipo(item.equipo);
    setJj(item.jj);
    setJg(item.jg);
    setJe(item.je);
    setJp(item.jp);
    setGc(item.gc);
    setGf(item.gf);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este equipo de la tabla?")) return;
    try {
      await deleteDoc(doc(db, 'tablaGeneral', id));
      await fetchTabla();
    } catch (err) {
      console.error("Error deleting equipo:", err);
      setError("Error al eliminar.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const startIndex = rawData.findIndex(row => row.includes('Equipo') && row.includes('PTS'));
      if (startIndex === -1) return alert('No se encontró la tabla.');
      const dataRows = rawData.slice(startIndex + 1).map(row => row.slice(2)).filter(row => row[0]);
      const parsedData = dataRows.map(row => ({
        equipo: row[0]?.toString().trim(),
        jj: parseInt(row[1]) || 0,
        jg: parseInt(row[2]) || 0,
        je: parseInt(row[3]) || 0,
        jp: parseInt(row[4]) || 0,
        gc: parseInt(row[5]) || 0,
        gf: parseInt(row[6]) || 0,
        dif: parseInt(row[7]) || 0,
        puntos: parseInt(row[8]) || 0,
        grupo: grupoSeleccionado
      }));
      setExcelPreview(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmarCargaExcel = async () => {
    if (!excelPreview.length) return;
    try {
      // Eliminar datos previos del mismo grupo en tablaGeneralPrevio
      const prevDocs = await getDocs(query(tablaPrevioRef, where("grupo", "==", grupoSeleccionado)));
      await Promise.all(prevDocs.docs.map(docRef => deleteDoc(doc(db, 'tablaGeneralPrevio', docRef.id))));

      // Guardar snapshot de la tabla actual como previa
      const existing = await getDocs(query(tablaCollectionRef, where("grupo", "==", grupoSeleccionado)));
      await Promise.all(existing.docs.map(docRef =>
        addDoc(tablaPrevioRef, { ...docRef.data(), idOriginal: docRef.id })
      ));

      await Promise.all(existing.docs.map(docRef => deleteDoc(doc(db, 'tablaGeneral', docRef.id))));
      await Promise.all(excelPreview.map(d => addDoc(tablaCollectionRef, d)));
      await fetchTabla();
      setExcelPreview([]);
      alert('Tabla actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando tabla:', error);
      alert('Error actualizando la tabla en Firebase.');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        🏆 Gestión de Tabla General
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Equipo</InputLabel>
        <Select value={grupoSeleccionado} label="Equipo" onChange={(e) => setGrupoSeleccionado(e.target.value)}>
          <MenuItem value="ITJ FC">ITJ FC</MenuItem>
          <MenuItem value="ITJaguars">ITJaguars</MenuItem>
        </Select>
      </FormControl>

      <Button variant="outlined" component="label" sx={{ mb: 3 }}>
        Cargar archivo Excel
        <input type="file" hidden accept=".xlsx" onChange={handleFileUpload} />
      </Button>

      {excelPreview.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1">Vista previa</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipo</TableCell><TableCell>JJ</TableCell><TableCell>JG</TableCell><TableCell>JE</TableCell><TableCell>JP</TableCell>
                <TableCell>GF</TableCell><TableCell>GC</TableCell><TableCell>DIF</TableCell><TableCell>PTS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {excelPreview.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.equipo}</TableCell>
                  <TableCell>{row.jj}</TableCell>
                  <TableCell>{row.jg}</TableCell>
                  <TableCell>{row.je}</TableCell>
                  <TableCell>{row.jp}</TableCell>
                  <TableCell>{row.gf}</TableCell>
                  <TableCell>{row.gc}</TableCell>
                  <TableCell>{row.dif}</TableCell>
                  <TableCell>{row.puntos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={confirmarCargaExcel}>Confirmar</Button>
            <Button variant="outlined" onClick={() => setExcelPreview([])}>Cancelar</Button>
          </Box>
        </Box>
      )}

      {error && <Typography color="error" mb={2}>{error}</Typography>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mb: 4, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
        <TextField label="Equipo" value={equipo} onChange={(e) => setEquipo(e.target.value)} required disabled={submitting} />
        <TextField label="JJ" type="number" value={jj} onChange={(e) => setJj(e.target.value)} required />
        <TextField label="JG" type="number" value={jg} onChange={(e) => setJg(e.target.value)} required />
        <TextField label="JE" type="number" value={je} onChange={(e) => setJe(e.target.value)} required />
        <TextField label="JP" type="number" value={jp} onChange={(e) => setJp(e.target.value)} required />
        <TextField label="GF" type="number" value={gf} onChange={(e) => setGf(e.target.value)} required />
        <TextField label="GC" type="number" value={gc} onChange={(e) => setGc(e.target.value)} required />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button type="submit" variant="contained" color="primary" disabled={submitting}>
          {submitting ? 'Guardando...' : (editingId ? 'Actualizar Equipo' : 'Añadir/Actualizar Equipo')}
        </Button>
        {editingId && (
          <Button variant="outlined" onClick={() => setEditingId(null)} disabled={submitting}>Cancelar</Button>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>Tabla Actual</Typography>
      {loading ? <CircularProgress /> : tabla.length === 0 ? (
        <Typography variant="body2">La tabla está vacía.</Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell><TableCell>Equipo</TableCell><TableCell>JJ</TableCell><TableCell>JG</TableCell><TableCell>JE</TableCell><TableCell>JP</TableCell>
                <TableCell>GF</TableCell><TableCell>GC</TableCell><TableCell>DIF</TableCell><TableCell>PTS</TableCell><TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabla.map((t, index) => (
                <TableRow key={t.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{t.equipo}</TableCell>
                  <TableCell>{t.jj}</TableCell>
                  <TableCell>{t.jg}</TableCell>
                  <TableCell>{t.je}</TableCell>
                  <TableCell>{t.jp}</TableCell>
                  <TableCell>{t.gf}</TableCell>
                  <TableCell>{t.gc}</TableCell>
                  <TableCell>{t.dif}</TableCell>
                  <TableCell>{t.puntos}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleEdit(t)} sx={{ mr: 1 }}>Editar</Button>
                    <Button variant="contained" size="small" color="error" onClick={() => handleDelete(t.id)}>Eliminar</Button>
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

export default LeagueTableManagement;
