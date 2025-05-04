import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip
} from '@mui/material';
import { ArrowDropUp, ArrowDropDown, Remove } from '@mui/icons-material';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const getLeftBorderColor = (index) => {
  if (index < 8) return '#66bb6a'; // verde
  if (index < 16) return '#fdd835'; // amarillo
  if (index < 24) return '#42a5f5'; // azul
  return 'transparent';
};

const abreviacionesEquipos = {
  "BAYER DALILA (M)": "BAYER",
  "DEPORTIVO GALILEO": "GALILEO",
  "GAMBLER": "GAMBLER",
  "A&E TRUCKING FC (Ma)": "A&E FC",
  "CELULANDIA (Ma)": "CELULANDIA",
  "YUCA FC": "YUCA",
  "TERAFIT (Ma)": "TERAFIT",
  "REAL TIJUANA (M)": "R. TIJUANA",
  "ATLAS (Ma)": "ATLAS",
  "MAXLR FC": "MAXLR",
  "INTER CALIFORNIA  FC": "INTER CALI",
  "EQUIPAMIENTO HPC": "HPC",
  "MILAN": "MILAN",
  "MALBORO FC": "MALBORO",
  "ESTACION OBISPO FC": "OBISPO FC",
  "IT JAGUARS FC": "IT JAGUARS",
  "UL BAJA FC (Ma)": "UL BAJA",
  "DRAGONES (M)": "DRAGONES",
  "CHELSEA (Ma)": "CHELSEA",
  "SAMEX FC": "SAMEX",
  "REAL FRANJA": "R. FRANJA",
  "JOYERIA VICTORIA": "JOY. VICTORIA",
  "ENCO FC (M)": "ENCO",
  "RENATO GELATO": "RENATO",
  "HOPS FC": "HOPS",
  "DEP REMEDIO (Ma)": "REMEDIO",
  "SAD BOYS FC (Ma)": "SAD BOYS",
  "INHUMILDES (M)": "INHUMILDES",
  "PUMA FC": "PUMA",
  "LA GERENCIA": "GERENCIA",
  "LOS HIJOS DEL BARRON": "HIJOS BARRON",
  "LOS TURBOS": "TURBOS",
  "VENICIA FC (Ma)": "VENICIA",
  "LEGION FC (Mi)": "LEGION",
  "ZORRILLOS": "ZORRILLOS",
  "CELL STORE (Mi)": "CELL STORE",
  "ATLETICO XOLOGORDOS (M)": "XOLOGORDOS",
  "MALA VIDA FC (Mi)": "MALA VIDA",
  "GRAFICOS": "GRAFICOS",
  "CARIÑOSOS FC (Mi)": "CARIÑOSOS",
  "FURIA FC": "FURIA",
  "CHARLATANES FC": "CHARLATANES",
  "MAN YU": "MAN YU",
  "JG JEANS": "JG JEANS",
  "LOS PRIMATES": "PRIMATES",
  "CLUB TIJUANA": "C. TIJUANA",
  "TPM": "TPM",
  "REAL TJ (M)": "REAL TJ",
  "ZL FC (Mi)": "ZL FC",
  "BONICE FC": "BONICE",
  "PANAS FC": "PANAS",
  "ATLETICO ACF (Mi)": "ACF",
  "DOGTORES FC (M)": "DOGTORES",
  "GALAXY FC (Mi)": "GALAXY",
  "PULLMANS (Mi)": "PULLMANS",
  "BAYERN (Mi)": "BAYERN",
  "REAL FENIX (M)": "R. FENIX",
  "CHAVEZ FC (Mi)": "CHAVEZ",
  "MONARCAS FC (Mi)": "MONARCAS",
  "BANDIDO FC (M)": "BANDIDO",
  "FC SERAV": "SERAV",
  "ITJ FC": "ITJ",
  "LOBOS TJ (Mi)": "LOBOS TJ",
  "LA RETA": "LA RETA",
  "PENIFLEX TRANCANEGRA FC": "PENIFLEX"
};



const abreviarNombre = (nombre) => {
  return abreviacionesEquipos[nombre] || nombre;
};


function StandingsTabs() {
  const [activeTab, setActiveTab] = useState('ITJaguars');
  const [data, setData] = useState({ 'ITJaguars': [], 'ITJ FC': [] });
  const [previousData, setPreviousData] = useState({ 'ITJaguars': [], 'ITJ FC': [] });

  const fetchData = async (grupo, isPrevious = false) => {
    const colName = isPrevious ? 'tablaGeneralPrevio' : 'tablaGeneral';
    const q = query(collection(db, colName), where('grupo', '==', grupo));
    const snapshot = await getDocs(q);
    const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordenar por puntos, luego por diferencia de goles, luego por goles a favor
    rawData.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.dif !== a.dif) return b.dif - a.dif;
      return b.gf - a.gf;
    });

    return rawData;
  };


  useEffect(() => {
    const fetchBoth = async () => {
      const [jaguars, fc, jaguarsPrev, fcPrev] = await Promise.all([
        fetchData('ITJaguars'),
        fetchData('ITJ FC'),
        fetchData('ITJaguars', true),
        fetchData('ITJ FC', true)
      ]);
      setData({ 'ITJaguars': jaguars, 'ITJ FC': fc });
      setPreviousData({ 'ITJaguars': jaguarsPrev, 'ITJ FC': fcPrev });
    };
    fetchBoth();
  }, []);

  const tabs = [
    { id: 'ITJaguars', label: 'ITJaguars (Martes)' },
    { id: 'ITJ FC', label: 'ITJ FC (Miércoles)' },
  ];

  const getPositionDelta = (equipo, currentIndex) => {
    const prevIndex = previousPositions[equipo];
    if (prevIndex === undefined) return null;
    const delta = prevIndex - currentIndex;
    if (delta > 0) return <ArrowDropUp fontSize="small" color="success" />;
    if (delta < 0) return <ArrowDropDown fontSize="small" color="error" />;
    return <Remove fontSize="small" color="disabled" />;
  };


  // Asegúrate que ambas listas estén ordenadas antes de generar esto
  const previousPositions = {};
  previousData[activeTab].forEach((team, i) => {
    previousPositions[team.equipo] = i;
  });

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Typography variant="h5" color="primary" gutterBottom fontWeight="bold" sx={{ textAlign: 'center', mb: 2 }}>
        Tabla General
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'contained' : 'outlined'}
            onClick={() => setActiveTab(tab.id)}
            sx={{ borderRadius: 5, fontWeight: 'bold' }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>
      <Box
        sx={{
          width: { xs: '100%', md: 700 },
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
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Equipo</TableCell>
              <TableCell>JJ</TableCell>
              <TableCell>JG</TableCell>
              <TableCell>JE</TableCell>
              <TableCell>JP</TableCell>
              <TableCell>GF</TableCell>
              <TableCell>GC</TableCell>
              <TableCell>DIF</TableCell>
              <TableCell>PTS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data[activeTab].map((t, index) => (
              <TableRow key={t.id}>
                <TableCell sx={{ borderLeft: `8px solid ${getLeftBorderColor(index)}`, backgroundColor: '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPositionDelta(t.equipo, index)}
                    <Typography ml={0.5}>{index + 1}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title={t.equipo} arrow enterDelay={100}>
                    <Typography fontWeight="bold" noWrap>
                      {abreviarNombre(t.equipo)}
                    </Typography>
                  </Tooltip>
                </TableCell>


                <TableCell>{t.jj}</TableCell>
                <TableCell>{t.jg}</TableCell>
                <TableCell>{t.je}</TableCell>
                <TableCell>{t.jp}</TableCell>
                <TableCell>{t.gf}</TableCell>
                <TableCell>{t.gc}</TableCell>
                <TableCell>{t.dif}</TableCell>
                <TableCell><Typography fontWeight="bold">{t.puntos}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

export default StandingsTabs;
