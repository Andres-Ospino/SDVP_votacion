import { useNavigate } from 'react-router-dom';
import { Vote } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function Home() {
  const navigate = useNavigate();

  const { data: activeElection, isLoading } = useQuery({
    queryKey: ['activeElection'],
    queryFn: async () => {
      try {
        const res = await api.get('/elections/active');
        return res.data;
      } catch (err) {
        return null;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center space-y-8 transform transition-all hover:scale-[1.02]">
        <div className="bg-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <Vote className="text-white w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Colegio San José
          </h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            {activeElection ? activeElection.title : 'Elecciones Estudiantiles'}
          </p>
        </div>

        <p className="text-gray-600">
          {activeElection 
            ? 'Tu voz cuenta. Participa en la elección de tu próximo representante de manera rápida y segura.' 
            : 'En este momento no hay elecciones activas. Por favor, vuelve más tarde.'}
        </p>

        <button
          onClick={() => navigate('/validate')}
          disabled={!activeElection || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Cargando...' : 'Iniciar Votación'}</span>
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500 font-medium">
        Sistema Democrático Virtual
      </div>
    </div>
  );
}
