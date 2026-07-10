import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';

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

  const electionId = sessionStorage.getItem('electionId');

  const { data: candidates, isLoading, error } = useQuery({
    queryKey: ['candidates', electionId],
    queryFn: async () => {
      const res = await api.get(`/candidates?electionId=${electionId}`);
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
        unique_code: student.unique_code,
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-body-md text-on-surface-variant">Cargando candidatos...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-body-md text-error">Error al cargar candidatos</div>;

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-surface shadow-sm z-50 sticky top-0">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-stack-lg max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-4">
            <span className="font-headline-lg text-primary tracking-tight hidden md:block">Sistema de Elección de Personero</span>
            <span className="font-headline-lg-mobile text-primary tracking-tight md:hidden">SEP</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="font-label-sm text-on-surface">{student?.name}</span>
              <span className="font-caption-xs text-on-surface-variant">Grado {student?.grade}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-stack-lg py-stack-lg flex flex-col items-center">
        {/* Progress Indicator */}
        <div className="w-full max-w-3xl mb-stack-xl mt-stack-md hidden sm:block">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-outline-variant -z-10"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/2 h-[2px] bg-primary -z-10 transition-all duration-500"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="font-caption-xs text-on-surface-variant">Identificación</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm ring-4 ring-primary-container/20">
                <span className="font-label-sm">2</span>
              </div>
              <span className="font-caption-xs text-primary font-medium">Votación</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant flex items-center justify-center">
                <span className="font-label-sm">3</span>
              </div>
              <span className="font-caption-xs text-on-surface-variant">Confirmación</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-stack-lg">
          <h1 className="font-headline-lg md:font-display-lg text-on-surface mb-2 tracking-tight">Elige a tu Personero</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">Selecciona el candidato de tu preferencia. Revisa sus propuestas antes de tomar una decisión.</p>
        </div>

        {voteMutation.isError && (
          <div className="w-full max-w-2xl bg-error-container text-error p-4 rounded-xl flex items-center space-x-3 mb-6">
            <span className="material-symbols-outlined">warning</span>
            <span className="font-body-md">{voteMutation.error.response?.data?.message || 'Error al registrar el voto'}</span>
          </div>
        )}

        {/* Candidate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter w-full mb-stack-xl">
          {candidates?.map((candidate) => (
            <div 
              key={candidate.id}
              className={`candidate-card bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 p-6 flex flex-col items-center text-center relative overflow-hidden group cursor-pointer border ${
                selectedCandidate?.id === candidate.id ? 'border-primary ring-2 ring-primary/20 bg-surface-container-low' : 'border-transparent hover:border-primary/10'
              } ${candidate.is_blank ? 'justify-center' : ''}`}
            >
              {!candidate.is_blank && (
                <div className="absolute top-4 left-4 bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center font-title-md font-bold shadow-sm">
                  {candidate.number?.toString().padStart(2, '0') || '00'}
                </div>
              )}
              
              <div className={`w-32 h-32 rounded-full overflow-hidden mb-4 border-4 transition-colors duration-300 mt-2 ${
                candidate.is_blank ? 'border-surface-container-highest group-hover:border-outline-variant flex items-center justify-center bg-surface-container-low' : 'border-surface-container-highest group-hover:border-primary-container'
              }`}>
                {!candidate.is_blank ? (
                  candidate.image_url ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${candidate.image_url}`} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                      <span className="material-symbols-outlined text-4xl text-outline">person</span>
                    </div>
                  )
                ) : (
                  <span className="material-symbols-outlined text-6xl text-outline-variant">how_to_vote</span>
                )}
              </div>
              
              <h3 className="font-title-md text-on-surface mb-1">{candidate.name}</h3>
              
              {!candidate.is_blank && (
                <>
                  <span className="font-label-sm text-secondary mb-4 bg-secondary-fixed/50 px-3 py-1 rounded-full">
                    {candidate.grade !== 'N/A' ? `Grado ${candidate.grade}` : 'Sin Grado'}
                  </span>
                  <p className="font-body-md text-on-surface-variant mb-6 line-clamp-3">
                    {candidate.proposal || "Sin propuestas detalladas."}
                  </p>
                </>
              )}

              {candidate.is_blank && (
                <p className="font-body-md text-on-surface-variant mb-6">Ninguna de las opciones anteriores.</p>
              )}

              <div className="mt-auto w-full flex flex-col gap-3">
                {!candidate.is_blank && (
                  <button className="flex items-center justify-center gap-2 text-primary font-label-sm hover:underline">
                    Ver Propuestas Completas <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                )}
                {candidate.is_blank && <div className="h-6"></div>}
                
                <button 
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowConfirm(true);
                  }}
                  className={`w-full font-label-sm py-3 rounded-lg hover:scale-[0.98] transition-transform shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    candidate.is_blank ? 'bg-surface-container-high text-on-surface focus:ring-outline border border-outline-variant' : 'bg-primary-container text-on-primary focus:ring-primary'
                  }`}
                >
                  {candidate.is_blank ? 'Votar en Blanco' : `Votar por ${candidate.name.split(' ')[0]}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Confirmation Modal Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-[100] flex items-center justify-center transition-opacity duration-300">
          <div className="bg-surface-container-lowest rounded-xl shadow-md w-full max-w-md mx-margin-mobile p-stack-lg transform scale-100 transition-transform duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h2 className="font-headline-lg-mobile text-on-surface mb-2">Confirmar Voto</h2>
              <p className="font-body-lg text-on-surface-variant mb-6">¿Estás seguro de que deseas registrar tu voto por <strong className="text-on-surface">{selectedCandidate.name}</strong>?</p>
              
              <div className="w-full bg-surface-container-low p-4 rounded-lg mb-6 border border-outline-variant/30 text-left">
                <p className="font-caption-xs text-on-surface-variant mb-1">Tu selección:</p>
                <div className="flex items-center gap-3">
                  {!selectedCandidate.is_blank && (
                    <span className="font-title-md bg-primary text-on-primary w-8 h-8 rounded flex items-center justify-center">
                      {selectedCandidate.number?.toString().padStart(2, '0') || '00'}
                    </span>
                  )}
                  <span className="font-title-md text-on-surface">{selectedCandidate.name}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={voteMutation.isPending}
                  className="w-full sm:w-1/2 py-3 rounded-lg font-label-sm bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors focus:outline-none focus:ring-2 focus:ring-outline disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => voteMutation.mutate(selectedCandidate.id)}
                  disabled={voteMutation.isPending}
                  className="w-full sm:w-1/2 py-3 rounded-lg font-label-sm bg-primary-container text-on-primary hover:scale-[0.98] transition-transform shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex justify-center items-center disabled:opacity-50"
                >
                  {voteMutation.isPending ? (
                    <><span className="material-symbols-outlined animate-spin text-sm mr-2">refresh</span> Procesando...</>
                  ) : (
                    'Confirmar Voto'
                  )}
                </button>
              </div>
              <p className="font-caption-xs text-on-surface-variant mt-4 text-center">Esta acción es irreversible una vez confirmada.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-stack-lg px-margin-mobile border-t border-outline-variant max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest shadow-sm mt-auto">
        <span className="text-label-sm font-label-sm text-on-surface-variant mb-4 md:mb-0">© 2026 Sistema de Elección de Personero. Institucional e Integridad.</span>
        <div className="flex gap-4">
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Legal</a>
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Manual</a>
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
