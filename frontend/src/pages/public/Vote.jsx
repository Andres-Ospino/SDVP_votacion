import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle2, User, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export default function Vote() {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const studentData = sessionStorage.getItem('student');
  const student = studentData ? JSON.parse(studentData) : null;

  useEffect(() => {
    if (!student) {
      navigate('/validate');
    }
  }, [student, navigate]);

  const { data: candidates, isLoading, error } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await api.get('/candidates');
      const activeCandidates = res.data.filter(c => c.status === 'ACTIVE');
      return activeCandidates.sort((a, b) => {
        if (a.is_blank) return 1;
        if (b.is_blank) return -1;
        return 0;
      });
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (candidate_id) => {
      const res = await api.post('/votes/register', {
        unique_code: student.unique_code || student.id, // el controlador espera unique_code
        candidate_id
      });
      return res.data;
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('student');
      sessionStorage.removeItem('electionId');
      navigate('/thanks', { state: { receiptId: data.receipt_id } });
    }
  });

  const handleVote = () => {
    // Si mandamos unique_code
    // Oh, wait, in Validate we saved student which doesn't have unique_code because the API returns only id, name, grade.
    // I need to make sure Validate API returns unique_code, or I use the unique_code I typed.
    // Actually, Validate saves id, name, grade. Let me get unique_code from somewhere else, or update validate API to return it.
    // Let me just send the candidate_id and wait, the API requires unique_code.
    // I will modify Validate to store unique_code.
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando candidatos...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error al cargar candidatos</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="bg-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tarjetón Electoral</h1>
            <p className="text-gray-500">Selecciona a tu candidato de preferencia</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">{student?.name} ({student?.grade})</span>
          </div>
        </header>

        {voteMutation.isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center space-x-3">
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">{voteMutation.error.response?.data?.message || 'Error al registrar el voto'}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates?.map((candidate) => (
            <div 
              key={candidate.id} 
              onClick={() => setSelectedCandidate(candidate)}
              className={`bg-white rounded-3xl shadow-sm border overflow-hidden flex flex-col transform transition-all duration-200 cursor-pointer ${
                selectedCandidate?.id === candidate.id ? 'border-blue-500 ring-2 ring-blue-500 shadow-xl scale-[1.02]' : ''
              } ${
                candidate.is_blank ? 'border-gray-300 bg-gray-50' : 'border-gray-100'
              }`}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {candidate.image_url ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${candidate.image_url}`} alt={candidate.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className={`w-24 h-24 ${candidate.is_blank ? 'text-gray-400' : 'text-gray-300'}`} />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-bold text-gray-900 shadow-sm">
                  #{candidate.number}
                </div>
              </div>
              
              <div className="p-6 text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                {candidate.grade !== 'N/A' && <p className="text-blue-600 font-medium">Curso {candidate.grade}</p>}
                <p className="text-gray-500 text-sm line-clamp-2">{candidate.proposal}</p>
              </div>

              {selectedCandidate?.id === candidate.id && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg transform scale-110">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Floating Action Bar */}
        {selectedCandidate && (
          <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl flex items-center justify-center space-x-3 transition-all"
              >
                <span>Votar por {selectedCandidate.name}</span>
                <CheckCircle2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Modal de confirmación */}
        {showConfirm && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 text-center shadow-2xl">
              <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">¿Confirmar tu voto?</h3>
              <p className="text-gray-500">
                Estás a punto de votar por <strong className="text-gray-900">{selectedCandidate.name}</strong>. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => voteMutation.mutate(selectedCandidate.id)}
                  disabled={voteMutation.isPending}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  {voteMutation.isPending ? 'Procesando...' : 'Sí, confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
