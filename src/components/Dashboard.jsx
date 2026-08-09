import React, { useState } from 'react';
import { useClanData } from '../hooks/useClanData';
import { Crown, CloudUpload, CloudDownload, Plus, Minus, Trash2, UserPlus, X } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const mockPlayers = [
  { id: '1', nombre: 'Rey Bárbaro', th: 15, ataquesCapital: 20, puntosJuegos: 8000, ataquesClasicasUsados: 4, estrellasCWL: 15, diasJugadosCWL: 5 },
  { id: '2', nombre: 'Reina Arquera', th: 15, ataquesCapital: 24, puntosJuegos: 10000, ataquesClasicasUsados: 6, estrellasCWL: 21, diasJugadosCWL: 7 },
  { id: '3', nombre: 'Centinela', th: 14, ataquesCapital: 12, puntosJuegos: 4000, ataquesClasicasUsados: 2, estrellasCWL: 8, diasJugadosCWL: 4 },
  { id: '4', nombre: 'Luchadora', th: 16, ataquesCapital: 24, puntosJuegos: 10000, ataquesClasicasUsados: 4, estrellasCWL: 18, diasJugadosCWL: 6 },
  { id: '5', nombre: 'Mago', th: 13, ataquesCapital: 18, puntosJuegos: 6000, ataquesClasicasUsados: 3, estrellasCWL: 12, diasJugadosCWL: 5 },
  { id: '6', nombre: 'Pekka', th: 14, ataquesCapital: 22, puntosJuegos: 9500, ataquesClasicasUsados: 5, estrellasCWL: 16, diasJugadosCWL: 6 },
  { id: '7', nombre: 'Dragón', th: 16, ataquesCapital: 24, puntosJuegos: 10000, ataquesClasicasUsados: 6, estrellasCWL: 20, diasJugadosCWL: 7 },
  { id: '8', nombre: 'Montapuercos', th: 12, ataquesCapital: 15, puntosJuegos: 5000, ataquesClasicasUsados: 2, estrellasCWL: 6, diasJugadosCWL: 3 },
  { id: '9', nombre: 'Minero', th: 11, ataquesCapital: 10, puntosJuegos: 3000, ataquesClasicasUsados: 1, estrellasCWL: 4, diasJugadosCWL: 2 },
  { id: '10', nombre: 'Yeti', th: 15, ataquesCapital: 24, puntosJuegos: 10000, ataquesClasicasUsados: 6, estrellasCWL: 21, diasJugadosCWL: 7 },
];

export default function Dashboard() {
  const {
    jugadores,
    setJugadores,
    metaCapitalGlobal,
    setMetaCapitalGlobal,
    metaClasicasGlobal,
    setMetaClasicasGlobal,
    addJugador,
    removeJugador
  } = useClanData(mockPlayers);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTH, setNewPlayerTH] = useState('');

  const docRef = doc(db, 'clanData', 'estadoMensual');

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await setDoc(docRef, {
        jugadores,
        metaCapitalGlobal,
        metaClasicasGlobal,
        updatedAt: new Date().toISOString()
      });
      alert('✅ Datos guardados correctamente en Firebase.');
    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
      alert('❌ Hubo un error al guardar los datos.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadDB = async () => {
    setIsLoadingDB(true);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.jugadores) setJugadores(data.jugadores);
        if (data.metaCapitalGlobal) setMetaCapitalGlobal(data.metaCapitalGlobal);
        if (data.metaClasicasGlobal) setMetaClasicasGlobal(data.metaClasicasGlobal);
        alert('✅ Datos cargados correctamente desde Firebase.');
      } else {
        alert('⚠️ No se encontraron datos guardados previamente en la nube.');
      }
    } catch (error) {
      console.error('Error al cargar de Firebase:', error);
      alert('❌ Hubo un error al cargar los datos.');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const updatePlayer = (id, field, value) => {
    setJugadores(prev => 
      prev.map(p => {
        if (p.id === id) {
          const newValue = Math.max(0, Number(value));
          return { ...p, [field]: newValue };
        }
        return p;
      })
    );
  };

  const updateClassicWars = (id, increment) => {
    setJugadores(prev => 
      prev.map(p => {
        if (p.id === id) {
          let newValue = Math.max(0, p.ataquesClasicasUsados + increment);
          return { ...p, ataquesClasicasUsados: newValue };
        }
        return p;
      })
    );
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addJugador(newPlayerName.trim(), Number(newPlayerTH) || 1);
      setNewPlayerName('');
      setNewPlayerTH('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-xl shadow-2xl">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
              Clan Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-sm font-medium">Gestión mensual de actividad y puntos</p>
          </div>
          
          <div className="flex flex-wrap items-end gap-4 w-full xl:w-auto">
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Meta Capital</label>
              <input 
                type="number" 
                value={metaCapitalGlobal}
                onChange={(e) => setMetaCapitalGlobal(Number(e.target.value))}
                className="w-20 bg-gray-950 border border-gray-700 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-medium"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Meta Clásicas</label>
              <input 
                type="number" 
                value={metaClasicasGlobal}
                onChange={(e) => setMetaClasicasGlobal(Number(e.target.value))}
                className="w-20 bg-gray-950 border border-gray-700 rounded-lg px-2 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-medium"
              />
            </div>

            <div className="flex-1"></div>
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 active:scale-95"
            >
              {showAddForm ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span className="hidden sm:inline">{showAddForm ? 'Cancelar' : 'Añadir Miembro'}</span>
            </button>

            <button 
              onClick={handleLoadDB}
              disabled={isLoadingDB}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg border ${isLoadingDB ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-gray-900 border-cyan-800/50 hover:bg-gray-800 hover:border-cyan-500/50 text-cyan-400 active:scale-95'}`}
            >
              <CloudDownload className={`w-5 h-5 ${isLoadingDB ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isLoadingDB ? 'Cargando...' : 'Descargar DB'}</span>
            </button>

            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg ${isSyncing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white hover:shadow-emerald-500/25 active:scale-95'}`}
            >
              <CloudUpload className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Guardando...' : 'Guardar en Nube'}</span>
            </button>
          </div>
        </header>

        {/* Formulario Añadir Jugador */}
        {showAddForm && (
          <div className="bg-gray-900/60 border border-emerald-900/50 p-6 rounded-2xl shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Registrar Nuevo Miembro</h3>
            <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col w-full sm:w-64">
                <label className="text-xs text-gray-400 mb-1 ml-1">Nombre en el Juego</label>
                <input 
                  type="text" 
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Ej: Bárbaro Furioso"
                  className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                />
              </div>
              <div className="flex flex-col w-full sm:w-32">
                <label className="text-xs text-gray-400 mb-1 ml-1">Nivel TH (Opcional)</label>
                <input 
                  type="number" 
                  value={newPlayerTH}
                  onChange={(e) => setNewPlayerTH(e.target.value)}
                  placeholder="Ej: 14"
                  className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                />
              </div>
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                Agregar
              </button>
            </form>
          </div>
        )}

        {/* Tabla Principal */}
        <div className="overflow-x-auto bg-gray-900/40 border border-gray-800 rounded-2xl shadow-xl backdrop-blur-md pb-4">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-4 font-semibold">Rank</th>
                <th className="px-6 py-4 font-semibold">Jugador</th>
                <th className="px-6 py-4 font-semibold text-center">Capital Raids</th>
                <th className="px-6 py-4 font-semibold text-center">Clan Games</th>
                <th className="px-6 py-4 font-semibold text-center">Classic Wars</th>
                <th className="px-6 py-4 font-semibold text-center">CWL</th>
                <th className="px-6 py-4 font-semibold text-right text-emerald-400">Total Score</th>
                <th className="px-4 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {jugadores.map((jugador, index) => {
                const isTop8 = index < 8;
                const isFirst = index === 0;

                return (
                  <tr 
                    key={jugador.id} 
                    className={`group transition-colors hover:bg-gray-800/40 ${isTop8 ? 'bg-emerald-950/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-lg font-bold ${isFirst ? 'text-amber-400' : isTop8 ? 'text-emerald-400' : 'text-gray-500'}`}>
                          #{index + 1}
                        </span>
                        {isFirst && <Crown className="w-5 h-5 text-amber-400 drop-shadow-md" />}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">
                        {jugador.nombre}
                        {jugador.th && <span className="ml-2 text-xs text-gray-500 font-mono bg-gray-900 px-1.5 py-0.5 rounded">TH{jugador.th}</span>}
                      </div>
                      {isTop8 && <div className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider mt-0.5">Bonus CWL</div>}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <input 
                        type="number" 
                        value={jugador.ataquesCapital}
                        onChange={(e) => updatePlayer(jugador.id, 'ataquesCapital', e.target.value)}
                        className="w-16 bg-gray-950/50 border border-gray-700/50 rounded px-2 py-1 text-center text-gray-300 focus:ring-1 focus:ring-emerald-500 outline-none transition-all hover:bg-gray-800 focus:bg-gray-950"
                      />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <input 
                        type="number" 
                        value={jugador.puntosJuegos}
                        step="100"
                        onChange={(e) => updatePlayer(jugador.id, 'puntosJuegos', e.target.value)}
                        className="w-20 bg-gray-950/50 border border-gray-700/50 rounded px-2 py-1 text-center text-gray-300 focus:ring-1 focus:ring-emerald-500 outline-none transition-all hover:bg-gray-800 focus:bg-gray-950"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className="flex items-center justify-between w-32 bg-gray-950/50 border border-gray-800 rounded-lg p-1">
                          <span className="text-[10px] text-gray-500 font-semibold w-8 text-right pr-1">USOS</span>
                          <button onClick={() => updateClassicWars(jugador.id, -1)} className="p-1 rounded bg-gray-800 hover:bg-red-500/20 hover:text-red-400 transition-colors text-gray-400"><Minus className="w-3 h-3"/></button>
                          <span className="w-4 text-center font-mono text-sm">{jugador.ataquesClasicasUsados}</span>
                          <button onClick={() => updateClassicWars(jugador.id, 1)} className="p-1 rounded bg-gray-800 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-gray-400"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                       <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-950/50 border border-gray-800 rounded-lg p-1 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                          <span className="text-[10px] text-gray-500 font-semibold w-12 text-right">ESTRELLAS</span>
                          <input 
                            type="number" 
                            value={jugador.estrellasCWL}
                            onChange={(e) => updatePlayer(jugador.id, 'estrellasCWL', e.target.value)}
                            className="w-10 bg-transparent text-center text-gray-300 font-mono text-sm outline-none rounded"
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-gray-950/50 border border-gray-800 rounded-lg p-1 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                          <span className="text-[10px] text-gray-500 font-semibold w-12 text-right">DÍAS</span>
                          <input 
                            type="number" 
                            value={jugador.diasJugadosCWL}
                            onChange={(e) => updatePlayer(jugador.id, 'diasJugadosCWL', e.target.value)}
                            className="w-10 bg-transparent text-center text-gray-300 font-mono text-sm outline-none rounded"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-2xl font-bold transition-all ${isFirst ? 'text-amber-400 drop-shadow-md' : isTop8 ? 'text-emerald-400' : 'text-gray-300'}`}>
                          {jugador.totalScore.toFixed(1)}
                        </span>
                        <div className="flex gap-1 text-[9px] text-gray-500 mt-1 font-mono bg-gray-950/50 px-2 py-0.5 rounded-full border border-gray-800 shadow-inner">
                          <span title="Puntos de Capital">{jugador.detallesPuntaje.capital}</span>|
                          <span title="Puntos de Juegos">{jugador.detallesPuntaje.juegos}</span>|
                          <span title="Puntos Clásicas">{jugador.detallesPuntaje.clasicas}</span>|
                          <span title="Puntos CWL">{jugador.detallesPuntaje.cwl}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => removeJugador(jugador.id)}
                        title="Eliminar Jugador"
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {jugadores.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>No hay jugadores en la tabla. Añade un miembro para comenzar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

