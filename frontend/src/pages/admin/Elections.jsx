import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Calendar, CheckCircle2, Clock, Check, X } from 'lucide-react';

export default function Elections() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: ''
  });

  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await api.get('/elections')).data
  });

  // Query to get all active candidates to clone
  const { data: activeCandidates } = useQuery({
    queryKey: ['adminCandidates'],
    queryFn: async () => {
      const res = await api.get('/candidates');
      // Filtrar solo candidatos activos y que no sean el voto en blanco
      return res.data.filter(c => c.status === 'ACTIVE' && !c.is_blank);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active, status }) => {
      return api.put(`/elections/${id}/status`, { is_active, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/elections', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      setShowModal(false);
      setFormData({ title: '', start_date: '', end_date: '' });
      setSelectedCandidateIds([]);
    }
  });

  const handleActivate = (id) => {
    if (window.confirm('¿Seguro que deseas activar esta elección? Las demás pasarán a estar completadas/inactivas.')) {
      toggleStatusMutation.mutate({ id, is_active: true, status: 'ACTIVE' });
    }
  };

  const handleClose = (id) => {
    if (window.confirm('¿Seguro que deseas cerrar esta elección?')) {
      toggleStatusMutation.mutate({ id, is_active: false, status: 'COMPLETED' });
    }
  };

  const handleCandidateToggle = (candidateId) => {
    setSelectedCandidateIds(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      candidateIds: selectedCandidateIds
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Elecciones</h1>
          <p className="text-gray-500">Gestión de periodos electorales</p>
        </div>
        <button 
          onClick={() => {
            setShowModal(true);
            setSelectedCandidateIds([]);
            setFormData({ title: '', start_date: '', end_date: '' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2"
        >
          <Calendar className="w-5 h-5" />
          <span>Nueva Elección</span>
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Cargando...</div>
        ) : elections?.map(election => (
          <div key={election.id} className={`bg-white rounded-3xl p-6 border-2 transition-all ${election.is_active ? 'border-green-500 shadow-md' : 'border-gray-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
                  {election.is_active && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>ACTIVA</span>
                    </span>
                  )}
                  {!election.is_active && election.status === 'COMPLETED' && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">COMPLETADA</span>
                  )}
                  {!election.is_active && election.status === 'PENDING' && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">PENDIENTE</span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Inicio: {new Date(election.start_date).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fin: {new Date(election.end_date).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                {!election.is_active ? (
                  <button 
                    onClick={() => handleActivate(election.id)}
                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Abrir Elección</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleClose(election.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <span>Cerrar Elección</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nueva Elección</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input 
                  type="datetime-local" 
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                <input 
                  type="datetime-local" 
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {activeCandidates && activeCandidates.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-900 mb-3">Candidatos a Participar</label>
                  <p className="text-xs text-gray-500 mb-3">Selecciona los candidatos que participarán en esta elección (se generará una copia de ellos). El Voto en Blanco se incluye automáticamente.</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {activeCandidates.map(candidate => (
                      <label key={candidate.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedCandidateIds.includes(candidate.id)}
                          onChange={() => handleCandidateToggle(candidate.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-xs text-gray-500">Grado: {candidate.grade} • Tarjetón: {candidate.number}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors mt-6 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Guardando...' : 'Crear Elección'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
