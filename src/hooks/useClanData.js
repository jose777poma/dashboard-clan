import { useState, useMemo, useEffect } from 'react';

export const useClanData = (initialJugadores = []) => {
  // Inicialización diferida usando localStorage
  const [jugadores, setJugadores] = useState(() => {
    const saved = localStorage.getItem('clanData_jugadores');
    if (saved) return JSON.parse(saved);
    return initialJugadores.length > 0 ? initialJugadores : [];
  });

  const [metaCapitalGlobal, setMetaCapitalGlobal] = useState(() => {
    const saved = localStorage.getItem('clanData_metaCapital');
    return saved ? JSON.parse(saved) : 24;
  });

  const [metaClasicasGlobal, setMetaClasicasGlobal] = useState(() => {
    const saved = localStorage.getItem('clanData_metaClasicas');
    return saved ? JSON.parse(saved) : 20;
  });

  const [metaJuegosGlobal, setMetaJuegosGlobal] = useState(10000); // Fijo por defecto

  // Persistir cambios en localStorage
  useEffect(() => {
    localStorage.setItem('clanData_jugadores', JSON.stringify(jugadores));
  }, [jugadores]);

  useEffect(() => {
    localStorage.setItem('clanData_metaCapital', JSON.stringify(metaCapitalGlobal));
  }, [metaCapitalGlobal]);

  useEffect(() => {
    localStorage.setItem('clanData_metaClasicas', JSON.stringify(metaClasicasGlobal));
  }, [metaClasicasGlobal]);

  const jugadoresCalculados = useMemo(() => {
    const procesados = jugadores.map(jugador => {
      // Extraemos propiedades con valores por defecto a 0
      const {
        ataquesCapital = 0,
        puntosJuegos = 0,
        ataquesClasicasUsados = 0,
        estrellasCWL = 0,
        diasJugadosCWL = 0
      } = jugador;

      // 1. Puntaje Capital (40 pts máximo)
      let ptsCapital = (ataquesCapital / metaCapitalGlobal) * 40;
      ptsCapital = Math.min(ptsCapital, 40);

      // 2. Puntaje Juegos (30 pts máximo)
      let ptsJuegos = (puntosJuegos / 10000) * 30;
      ptsJuegos = Math.min(ptsJuegos, 30);

      // 3. Puntaje Guerras Clásicas (15 pts máximo)
      let ptsClasicas = (ataquesClasicasUsados / metaClasicasGlobal) * 15;
      ptsClasicas = Math.min(ptsClasicas, 15);

      // 4. Puntaje CWL (15 pts máximo)
      let ptsCWL = 0;
      if (diasJugadosCWL > 0) {
        ptsCWL = (estrellasCWL / (diasJugadosCWL * 3)) * 15;
      }
      ptsCWL = Math.min(ptsCWL, 15);

      // Suma total y redondeo a un decimal
      const scoreSuma = ptsCapital + ptsJuegos + ptsClasicas + ptsCWL;
      const totalScore = Math.round(scoreSuma * 10) / 10;

      return {
        ...jugador,
        detallesPuntaje: {
          capital: Math.round(ptsCapital * 10) / 10,
          juegos: Math.round(ptsJuegos * 10) / 10,
          clasicas: Math.round(ptsClasicas * 10) / 10,
          cwl: Math.round(ptsCWL * 10) / 10,
        },
        totalScore,
      };
    });

    // Se elimina el ordenamiento automático
    return procesados;
  }, [jugadores, metaCapitalGlobal, metaClasicasGlobal]);

  const addJugador = (nombre, th) => {
    const nuevoJugador = {
      id: crypto.randomUUID(),
      nombre,
      th,
      ataquesCapital: 0,
      puntosJuegos: 0,
      ataquesClasicasUsados: 0,
      estrellasCWL: 0,
      diasJugadosCWL: 0
    };
    setJugadores(prev => [...prev, nuevoJugador]);
  };

  const removeJugador = (id) => {
    setJugadores(prev => prev.filter(jugador => jugador.id !== id));
  };

  const sortJugadoresManually = () => {
    // Ordenamos el estado base utilizando los puntajes ya calculados
    const scoreMap = new Map();
    jugadoresCalculados.forEach(j => scoreMap.set(j.id, j.totalScore));
    
    setJugadores(prev => [...prev].sort((a, b) => {
      const scoreA = scoreMap.get(a.id) || 0;
      const scoreB = scoreMap.get(b.id) || 0;
      return scoreB - scoreA;
    }));
  };

  return {
    jugadores: jugadoresCalculados,
    setJugadores,
    metaCapitalGlobal,
    setMetaCapitalGlobal,
    metaJuegosGlobal,
    setMetaJuegosGlobal,
    metaClasicasGlobal,
    setMetaClasicasGlobal,
    addJugador,
    removeJugador,
    sortJugadoresManually
  };
};

