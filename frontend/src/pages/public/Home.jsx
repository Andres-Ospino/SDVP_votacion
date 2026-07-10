import { useNavigate } from 'react-router-dom';
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
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md antialiased relative">
      <div className="absolute inset-0 z-0 pointer-events-none bg-pattern"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-surface-container-high opacity-50 blur-[100px] pointer-events-none"></div>
      
      <header className="w-full flex justify-between items-center px-margin-mobile md:px-stack-lg max-w-container-max mx-auto h-16 bg-surface-container-lowest shadow-sm z-50 relative">
        <div className="flex items-center gap-stack-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          <span className="font-headline-lg-mobile md:font-headline-lg text-primary tracking-tight">Sistema de Elección de Personero</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-stack-xl px-margin-mobile md:px-stack-lg z-10 relative">
        <div className="max-w-container-max w-full grid grid-cols-1 lg:grid-cols-12 gap-stack-lg lg:gap-stack-xl items-center">
          <div className="lg:col-span-5 flex flex-col gap-stack-md text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm w-fit mx-auto lg:mx-0 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Proceso Electoral Seguro</span>
            </div>
            <h1 className="font-display-lg text-on-surface">Elección de Personero Estudiantil 2026</h1>
            <p className="font-body-lg text-on-surface-variant">
              Tu participación es fundamental para el desarrollo de nuestra comunidad. Ingresa a la plataforma para conocer a los candidatos y ejercer tu derecho al voto de manera transparente y segura.
            </p>
            <div className="mt-stack-md bg-surface-container-lowest shadow-md rounded-xl p-gutter border border-outline-variant/30 flex flex-col gap-stack-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h2 className="font-title-md text-on-surface mb-2">Acceso a la Urna Virtual</h2>
                <p className="font-body-md text-on-surface-variant mb-6">
                  {activeElection 
                    ? `Actualmente está en curso la elección: ${activeElection.title}. Utiliza tus credenciales institucionales para verificar tu identidad.` 
                    : 'En este momento no hay elecciones activas. Por favor, vuelve más tarde.'}
                </p>
                <button 
                  onClick={() => navigate('/validate')}
                  disabled={!activeElection || isLoading}
                  className="w-full bg-primary text-on-primary font-label-sm py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Cargando...' : 'Iniciar votación'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 w-full h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-sm relative border border-outline-variant/20 bg-surface-container-low mt-stack-lg lg:mt-0">
            <img className="absolute inset-0 w-full h-full object-cover" alt="Render 3D de urna" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvrM43eaiB7KaLcWcRuo_UDOrqQRhu8HRXKH8AqlfE8BOJPXSZi1_nRdLWhkqw7tKYLGZASCgn91ut6vvVO8CeCsq-7o44GsMMlx7W1-On-KLe4ioFuLcaamiSm5D7BbdK2nO6rUuPVsWl2VthW10b7EN7zR4hf24Whg3h7NLnK0BXae_jdHlOSkt7RMNWvHPzqt-W52nPJl7jA-I0ZwbWpB_edPDATnib2lzFTXR0a3dnUFOr_CZowst2A300LNE0IZPAeMxJ1Xs"/>
          </div>
        </div>
      </main>

      <footer className="w-full py-stack-lg px-margin-mobile border-t border-outline-variant max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest shadow-sm z-50 relative mt-auto">
        <span className="text-label-sm font-label-sm text-on-surface-variant text-center md:text-left mb-4 md:mb-0">
            © 2026 Sistema de Elección de Personero. Institucional e Integridad.
        </span>
        <div className="flex flex-wrap justify-center gap-stack-md">
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Legal</a>
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Manual</a>
          <a className="text-body-md font-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
