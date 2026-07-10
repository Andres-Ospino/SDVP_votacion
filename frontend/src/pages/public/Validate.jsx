import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
    <div className="h-full min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center font-body-md antialiased relative">
      <div className="absolute inset-0 z-0 pointer-events-none bg-pattern"></div>
      
      {/* Top App Bar */}
      <header className="fixed top-0 w-full bg-surface-container-lowest shadow-sm h-16 flex justify-center items-center px-margin-mobile z-50">
        <div className="font-headline-lg text-primary tracking-tight font-bold">Sistema de Elección de Personero</div>
      </header>
      
      <main className="w-full max-w-lg px-margin-mobile flex flex-col items-center gap-stack-lg mt-16 z-10 relative">
        <div className="text-center">
          <h1 className="font-display-lg text-on-surface mb-stack-sm">Validación</h1>
          <p className="font-body-lg text-on-surface-variant">Ingresa tus credenciales para continuar.</p>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-xl shadow-md p-gutter border border-surface-variant transition-all duration-300 hover:shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="w-full bg-error-container rounded-xl shadow-sm p-4 border border-error relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                <p className="font-caption-xs text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span> {error}
                </p>
              </div>
            )}

            <div>
              <label className="block font-label-sm text-on-surface mb-stack-sm" htmlFor="codigo-estudiantil">Código Estudiantil</label>
              <div className="relative mb-stack-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" style={{ fontVariationSettings: "'FILL' 0" }}>badge</span>
                <input 
                  id="codigo-estudiantil"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-on-surface placeholder-outline" 
                  placeholder="Ej: 202301045"
                  disabled={validateMutation.isPending}
                />
              </div>
              <p className="font-caption-xs text-on-surface-variant">Tu código se encuentra en tu carné.</p>
            </div>

            <div>
              <label className="block font-label-sm text-on-surface mb-stack-sm" htmlFor="fecha-nacimiento">Fecha de Nacimiento</label>
              <div className="relative mb-stack-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
                <input 
                  id="fecha-nacimiento"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md text-on-surface placeholder-outline" 
                  disabled={validateMutation.isPending}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={validateMutation.isPending}
              className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-label-sm hover:bg-primary hover:text-on-primary active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validateMutation.isPending ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <>
                  <span>Continuar</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
                </>
              )}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="font-label-sm text-primary hover:underline"
              >
                Volver al inicio
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
