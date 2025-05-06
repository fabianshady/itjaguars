import React, { useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const STATUS_DISPLAY = {
  Pagado: { icon: '✓', color: '#2e7d32', bgColor: '#e8f5e9' },
  Pendiente: { icon: 'X', color: '#c62828', bgColor: '#ffebee' },
  Ausente: { icon: '-', color: '#616161', bgColor: '#f5f5f5' },
};

function DebtSummaryCard({ jugadores, eventos, asistencias }) {
  const deudas = useMemo(() => {
    const calculatedDeudas = {};
    if (!Array.isArray(jugadores)) return {};
    jugadores.forEach(j => {
      let deudaTotal = 0;
      if (Array.isArray(eventos)) {
        eventos.forEach(e => {
          const key = `${j.id}_${e.id}`;
          const asistencia = asistencias[key];
          if (asistencia && asistencia.estado === 'Pendiente') {
            deudaTotal += asistencia.costoAplicado ?? e.costo ?? 0;
          }
        });
      }
      calculatedDeudas[j.id] = { id: j.id, nombre: j.nombre, deuda: deudaTotal };
    });
    return Object.values(calculatedDeudas).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [jugadores, eventos, asistencias]);

  return (
    <Paper elevation={3} sx={{ background: 'linear-gradient(to bottom right, #c2e9fb, #a1c4fd)', p: 4, borderRadius: 4, mb: 6, maxWidth: 1500, mx: 'auto' }}>
      <Box
        sx={{
          overflowX: 'auto',
          maxWidth: '100%',
          scrollbarWidth: 'thin', /* Firefox */
          scrollbarColor: '#66bb6a #e0e0e0', /* color del scroll y fondo */
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#66bb6a', /* color del "scroll thumb" */
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#e0e0e0', /* color de la "pista" */
            borderRadius: '8px',
          },
        }}
      >
        <Typography variant="h5" color="primary" gutterBottom fontWeight="bold" sx={{ textAlign: 'center', mb: 2 }}>
          Accounting
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Pending (MXN)</TableCell>
              {eventos.map((e) => (
                <TableCell
                  key={e.id}
                  align="center"
                  sx={{ whiteSpace: 'nowrap' }}
                  title={`$${e.costo.toFixed(2)} - ${e.fecha.toDate().toLocaleDateString()}`}
                >
                  {e.nombre}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {deudas.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nombre}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: item.deuda > 0 ? '#c62828' : '#2e7d32' }}>
                  {item.deuda.toFixed(2)}
                </TableCell>
                {eventos.map((e) => {
                  const key = `${item.id}_${e.id}`;
                  const asistencia = asistencias[key];
                  const estado = asistencia?.estado || 'Ausente';
                  const display = STATUS_DISPLAY[estado] || STATUS_DISPLAY.Ausente;
                  return (
                    <TableCell
                      key={key}
                      align="center"
                      sx={{ backgroundColor: display.bgColor, color: display.color, fontWeight: 600 }}
                      title={`Estado: ${estado}`}
                    >
                      {display.icon}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>

  );
}

export default DebtSummaryCard;
