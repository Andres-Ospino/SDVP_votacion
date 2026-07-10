import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Fingerprint, CalendarDays, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function Validate() {
  const [code, setCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/votes/validate', { 
        unique_code: code,
        birth_date: birthDate
      });
      return res.data;
    },
    onSuccess: (data) => {
      sessionStorage.setItem('student', JSON.stringify(data.student));
      sessionStorage.setItem('electionId', data.electionId);
      navigate('/vote');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Error al validar');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || !birthDate) {
      setError('Por favor ingresa ambos datos');
      return;
    }
    validateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-8 relative z-10 border border-white/50">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
            <Fingerprint className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Validación Estudiantil</h2>
          <p className="text-gray-500">Ingresa tu código y fecha de nacimiento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Código Único</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej. EST001"
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-lg uppercase tracking-wider font-medium placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center space-x-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span>Fecha de Nacimiento</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 text-lg font-medium text-gray-700"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={validateMutation.isPending}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-xl shadow-gray-900/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {validateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Continuar</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
