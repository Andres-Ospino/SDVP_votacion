import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Calendar, CheckCircle2, Clock, Check } from 'lucide-react';

export default function Elections() {
  const queryClient = useQueryClient();
  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await api.get('/elections')).data
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active, status }) => {
      return api.put(`/elections/${id}`, { is_active, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Elecciones</h1>
          <p className="text-gray-500">Gestión de periodos electorales</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2">
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
    </div>
  );
}
