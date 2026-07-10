import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, User } from 'lucide-react';

export default function Candidates() {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['adminCandidates'],
    queryFn: async () => (await api.get('/candidates')).data
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-500">Administración de candidatos electorales</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Nuevo Candidato</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500 py-8">Cargando...</div>
        ) : candidates?.map(candidate => (
          <div key={candidate.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="aspect-square bg-gray-50 relative">
              {candidate.image_url ? (
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${candidate.image_url}`} alt={candidate.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-900 shadow-sm">
                {candidate.number}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{candidate.name}</h3>
              <p className="text-blue-600 text-sm font-medium mb-3">Curso {candidate.grade}</p>
              <div className="flex-1"></div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {candidate.status}
                </span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Editar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
