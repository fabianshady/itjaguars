import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Button, Fade } from '@mui/material';
import { parseISO } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';



const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '';
  const fecha = parseISO(fechaISO);
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let fechaFormateada = fecha.toLocaleDateString('en-US', opcionesFecha);
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

const iconosPorPosiciones = (posiciones = []) => {
  return posiciones.map((pos) => {
    const p = pos.toLowerCase();
    if (p.includes('portero')) return '🧤';
    if (p.includes('defensa')) return '🛡️';
    if (p.includes('medio')) return '🎯';
    if (p.includes('extremo')) return '🏃‍♂️';
    if (p.includes('delantero')) return '⚔️';
    return '❓';
  });
};



function MatchesTabs({ partidos, fotoActual, setFotoActual, fotos, jugadoresRegistrados }) {
  const [activeTab, setActiveTab] = useState('proximos');
  const [partidoActual, setPartidoActual] = useState(0);

  useEffect(() => {
    setPartidoActual(0); // reset al cambiar de tab
  }, [activeTab]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const partidosProximos = partidos.filter((p) => parseISO(p.fecha) >= hoy);
  const partidosAnteriores = partidos.filter((p) => parseISO(p.fecha) < hoy);
  const listaActual = activeTab === 'proximos' ? partidosProximos : partidosAnteriores;
  const partido = listaActual[partidoActual];

  const tabs = [
    { id: 'proximos', label: 'Next Matches' },
    { id: 'anteriores', label: 'Previous Matches' },
  ];

  return (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} pl={4} pr={4}>
      {/* Parte izquierda: contenido */}
      <Box flex={1}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: 'row' }}>
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'contained' : 'outlined'}
              onClick={() => setActiveTab(tab.id)}
              color="primary"
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Partido actual */}
        {partido && (
          <Fade key={partido.id} in={true} timeout={400}>
            <Box width={{ xs: '100%', md: 800 }} key={partido.id} sx={{ pb: 2, mb: 2 }} >
              {/* Fecha en grande */}
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatearFecha(partido.fecha)}
              </Typography>

              {/* Hora, Lugar y Rival en una sola línea */}
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={3} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="h5" sx={{ color: 'text.primary' }}>
                    {formatearHora(partido.hora)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h5" sx={{ color: 'text.primary' }}>
                    📍 {partido.lugar}
                  </Typography>
                </Box>

                {partido.rival && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h5" sx={{ color: 'text.primary' }}>
                      🆚 {partido.rival}
                    </Typography>
                  </Box>
                )}
              </Box>


              {/* Convocados o Marcador */}
              <Box mt={2}>
                {activeTab === 'proximos' ? (
                  <Box display="flex" flexWrap="wrap" gap={2} justifyContent="flex-start">
                    {partido.convocados.map((nombre, idx) => {
                      const jugador = jugadoresRegistrados.find(j => j.nombre === nombre);
                      if (!jugador) return null;

                      const iconos = iconosPorPosiciones(jugador.posiciones);

                      return (
                        <Box key={idx} display="flex" flexDirection="column" alignItems="center">
                          {/* Imagen de camiseta con dorsal */}
                          <Box
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              backgroundImage: `url(/camiseta.png)`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 0,
                                right: 0,
                                fontWeight: 'bold',
                                fontSize: 20,
                                color: '#fff',
                                textAlign: 'center',
                                textShadow: '0 0 3px #000',
                              }}
                            >
                              {jugador.dorsal}
                            </Typography>
                          </Box>

                          {/* Nombre debajo */}
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.5,
                              fontSize: 14,
                              fontWeight: 'bold',
                              textAlign: 'center',
                              maxWidth: 100,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {jugador.nombre}
                          </Typography>

                          {/* Íconos de posición */}
                          <Box mt={0.3} display="flex" gap={0.5}>
                            {iconos.map((icono, i) => (
                              <Typography key={i} variant="caption" fontSize={14}>
                                {icono}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  partido.marcador && (
                    <Box mt={1} display="flex" alignItems="center" gap={2}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Score: {partido.marcador}
                      </Typography>

                      {/* Chip de resultado */}
                      {(() => {
                        const [gf, gc] = partido.marcador.split('-').map(num => parseInt(num.trim(), 10));
                        if (isNaN(gf) || isNaN(gc)) return null;

                        let label = '';
                        let color = 'default';

                        if (gf > gc) {
                          label = 'Win';
                          color = 'success';
                        } else if (gf < gc) {
                          label = 'Lose';
                          color = 'error';
                        } else {
                          label = 'Draw';
                          color = 'warning';
                        }

                        return (
                          <Chip
                            label={label}
                            color={color}
                            sx={{ fontWeight: 'bold', fontSize: 14 }}
                          />
                        );
                      })()}
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Fade>

        )}

        {/* Navegación entre partidos */}
        {listaActual.length > 1 && (
          <Box display="flex" justifyContent="center" gap={1.5} mt={2} alignItems="center">
            {listaActual.map((_, i) => (
              <Box
                key={i}
                onClick={() => setPartidoActual(i)}
                sx={{
                  width: i === partidoActual ? 16 : 12,
                  height: i === partidoActual ? 16 : 12,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  backgroundColor: i === partidoActual ? 'primary.main' : '#ccc',
                  transition: 'all 0.3s ease',
                  transform: i === partidoActual ? 'scale(1.2)' : 'scale(1)',
                  '&:hover': {
                    backgroundColor: i === partidoActual ? 'primary.main' : 'grey.500',
                  },
                }}
              />
            ))}
          </Box>
        )}

      </Box>

      {/* Parte derecha: imagen */}
      <Box
        width={{ xs: '100%', md: 640 }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        position="relative"
      >
        <Box
          width="100%"
          height={500}
          position="relative"
          sx={{ overflow: 'hidden', borderRadius: '16px' }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={fotoActual}
              src={fotos[fotoActual]}
              alt={`Foto ${fotoActual + 1}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </AnimatePresence>
        </Box>

        {/* Botones ← → */}
        <Box display="flex" gap={2} mt={2} alignItems="center" justifyContent="center">
          {/* Botón anterior */}
          <Button
            onClick={() => setFotoActual(f => (f - 1 + fotos.length) % fotos.length)}
            size="small"
            variant="outlined"
            sx={{
              minWidth: 40,
              borderRadius: '50%',
              p: 0.5,
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </Button>

          {/* Indicador 1 / 4 */}
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: '999px',
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: 'text.primary',
              fontWeight: 'bold',
              fontSize: 14,
              minWidth: 50,
              textAlign: 'center',
            }}
          >
            {fotoActual + 1} / {fotos.length}
          </Typography>

          {/* Botón siguiente */}
          <Button
            onClick={() => setFotoActual(f => (f + 1) % fotos.length)}
            size="small"
            variant="outlined"
            sx={{
              minWidth: 40,
              borderRadius: '50%',
              p: 0.5,
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </Button>
        </Box>

      </Box>

    </Box>
  );
}

export default MatchesTabs;
