import React, { useState } from 'react';
import { Box, Typography, Chip, Paper, Button } from '@mui/material';
import { parseISO } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';
  const fecha = parseISO(fechaISO);
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let fechaFormateada = fecha.toLocaleDateString('es-MX', opcionesFecha);
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
};

const formatearHora = (hora24) => {
  if (!hora24) return '';
  const [hora, minutos] = hora24.split(':');
  const horaNum = parseInt(hora, 10);
  const ampm = horaNum >= 12 ? 'p.m.' : 'a.m.';
  const hora12 = ((horaNum + 11) % 12 + 1);
  return `${hora12}:${minutos} ${ampm}`;
};

function MatchesTabs({ partidos }) {
  const [activeTab, setActiveTab] = useState('proximos');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const partidosProximos = partidos.filter((p) => parseISO(p.fecha) >= hoy);
  const partidosAnteriores = partidos.filter((p) => parseISO(p.fecha) < hoy);

  const tabs = [
    { id: 'proximos', label: 'Próximos Partidos' },
    { id: 'anteriores', label: 'Partidos Anteriores' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 300 },
          position: { md: 'sticky' },
          top: { md: 24 },
          flexShrink: 0,
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" sx={{ textAlign: 'center', mb: 2 }}>
            Partidos
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'row', md: 'column' } }}>
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(tab.id)}
                color="primary"
                fullWidth
              >
                {tab.label}
              </Button>
            ))}
          </Box>

          <Box>
            {(activeTab === 'proximos' ? partidosProximos : partidosAnteriores).map(partido => (
              <Box key={partido.id} sx={{ borderBottom: '1px solid #ddd', pb: 2, mb: 2 }}>
                {/* Fecha */}
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body2">{formatearFecha(partido.fecha)}</Typography>
                </Box>

                {/* Hora */}
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">{formatearHora(partido.hora)}</Typography>
                </Box>

                {/* Lugar */}
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📍 {partido.lugar}
                </Typography>

                {/* Rival */}
                {partido.rival && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🆚 {partido.rival}
                  </Typography>
                )}

                {/* Convocados o Marcador */}
                {activeTab === 'proximos' ? (
                  partido.convocados?.length > 0 && (
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                      {partido.convocados.map((nombre, idx) => (
                        <Chip
                          key={idx}
                          label={nombre}
                          color='success'
                        />
                      ))}
                    </Box>
                  )
                ) : (
                  partido.marcador && (
                    <Box mt={1} display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2">
                        <strong>Marcador:</strong> {partido.marcador}
                      </Typography>

                      {/* Badge de Resultado */}
                      {(() => {
                        const [golesFavor, golesContra] = partido.marcador.split('-').map(num => parseInt(num.trim(), 10));
                        if (isNaN(golesFavor) || isNaN(golesContra)) return null; // seguridad

                        let label = '';
                        let color = 'default';

                        if (golesFavor > golesContra) {
                          label = 'Victoria';
                          color = 'success';
                        } else if (golesFavor < golesContra) {
                          label = 'Derrota';
                          color = 'error';
                        } else {
                          label = 'Empate';
                          color = 'warning';
                        }

                        return (
                          <Chip
                            label={label}
                            color={color}
                            sx={{ fontWeight: 'bold' }}
                          />
                        );
                      })()}
                    </Box>
                  )
                )}

              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default MatchesTabs;
