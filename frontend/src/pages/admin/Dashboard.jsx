import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserCheck, Activity, BarChart3, Download, Lock, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../../services/api';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/stats')).data
  });

  const { data: ranking } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => (await api.get('/stats/ranking')).data
  });

  const { data: activeElection } = useQuery({
    queryKey: ['activeElectionAdmin'],
    queryFn: async () => {
      try {
        return (await api.get('/elections/active')).data;
      } catch {
        return null;
      }
    }
  });

  const queryClient = useQueryClient();
  const updateElectionMutation = useMutation({
    mutationFn: async (data) => {
      if (!activeElection) return;
      return api.put(`/elections/${activeElection.id}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeElectionAdmin']);
    }
  });

  const closePollsMutation = useMutation({
    mutationFn: async () => {
      if (!activeElection) return;
      return api.post(`/elections/${activeElection.id}/close`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['activeElectionAdmin']);
      queryClient.invalidateQueries(['stats']);
      queryClient.invalidateQueries(['ranking']);
    }
  });

  const exportExcel = () => {
    if (!ranking) return;
    const ws = XLSX.utils.json_to_sheet(ranking.map(c => ({
      Candidato: c.name,
      Número: c.number,
      Curso: c.grade,
      Votos: c.votes
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ranking");
    XLSX.writeFile(wb, "Reporte_Elecciones.xlsx");
  };

  const exportPDF = () => {
    if (!ranking || !stats) return;
    const doc = new jsPDF();
    doc.text("Reporte de Elecciones - Colegio San José", 14, 15);
    doc.text(`Participación: ${stats.participation}% | Abstención: ${stats.abstention}%`, 14, 25);
    
    const tableData = ranking.map((c, i) => [i + 1, c.name, c.number, c.grade, c.votes]);
    doc.autoTable({
      startY: 30,
      head: [['#', 'Candidato', 'Número', 'Curso', 'Votos']],
      body: tableData,
    });
    
    doc.save("Reporte_Elecciones.pdf");
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen en tiempo real de las elecciones</p>
          {activeElection && (
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
              Elección Activa: {activeElection.title}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {activeElection && (
            <>
              <button 
                onClick={() => {
                  if(window.confirm('¿Deseas cerrar las urnas? Nadie más podrá votar.')) {
                    closePollsMutation.mutate();
                  }
                }}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Urnas</span>
              </button>
              
              <button 
                onClick={() => updateElectionMutation.mutate({ hide_results: !activeElection.hide_results })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeElection.hide_results ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {activeElection.hide_results ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{activeElection.hide_results ? 'Mostrar Resultados' : 'Ocultar Resultados'}</span>
              </button>
            </>
          )}

          <button onClick={exportExcel} className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-medium hover:bg-green-100 transition-colors">
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button onClick={exportPDF} className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors">
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Estudiantes</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Candidatos</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalCandidates || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Votos Totales</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalVotes || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Participación</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.participation || 0}%</p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico / Ranking list */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ranking de Candidatos</h2>
          
          {activeElection?.hide_results && activeElection?.status !== 'COMPLETED' ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
              <EyeOff className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Resultados Ocultos</h3>
              <p className="text-gray-500">Los resultados preliminares están censurados para evitar sesgos durante la jornada electoral. Utiliza el botón superior para revelarlos si es necesario.</p>
            </div>
          ) : null}

          <div className="space-y-6">
          {ranking?.map((candidate, index) => {
            const percentage = stats?.totalVotes > 0 ? ((candidate.votes / stats.totalVotes) * 100).toFixed(1) : 0;
            return (
              <div key={candidate.id} className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm overflow-hidden border border-gray-200">
                  {candidate.image_url ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${candidate.image_url}`} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900">{candidate.name}</span>
                    <span className="text-gray-500 text-sm">{candidate.votes} votos ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
