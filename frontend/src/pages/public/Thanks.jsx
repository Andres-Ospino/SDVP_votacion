import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

export default function Thanks() {
  const navigate = useNavigate();
  const location = useLocation();
  const receiptId = location.state?.receiptId;

  const downloadReceipt = () => {
    if (!receiptId) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Colegio San José", 105, 20, null, null, "center");
    doc.setFontSize(16);
    doc.text("Comprobante de Votación", 105, 30, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`ID de Transacción: ${receiptId}`, 20, 60);
    
    doc.text("Tu voto ha sido registrado exitosamente.", 20, 80);
    doc.text("Este documento es personal e intransferible.", 20, 90);
    
    doc.save(`Comprobante_Voto_${receiptId.substring(0,8)}.pdf`);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-margin-mobile font-body-md antialiased relative">
      <div className="absolute inset-0 z-0 pointer-events-none bg-pattern"></div>
      
      <main className="w-full max-w-md z-10 relative">
        <div className="bg-surface-container-lowest shadow-md rounded-xl p-stack-lg md:p-stack-xl flex flex-col items-center text-center border border-outline-variant/20">
          
          <div className="bg-primary-container w-24 h-24 rounded-full flex items-center justify-center mb-stack-lg shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-on-primary-container">check</span>
          </div>
          
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-stack-sm">
            ¡Gracias por votar!
          </h1>
          <p className="font-body-lg text-on-surface-variant mb-stack-xl">
            Su voto fue registrado correctamente.
          </p>

          {receiptId && (
            <div className="w-full mb-stack-lg">
              <p className="font-caption-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 text-center font-mono break-all">
                Recibo: {receiptId}
              </p>
              <button 
                onClick={downloadReceipt}
                className="mt-3 flex items-center justify-center gap-2 text-primary font-label-sm hover:underline w-full"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Descargar comprobante en PDF
              </button>
            </div>
          )}

          <button 
            onClick={() => navigate('/')}
            className="w-full bg-primary text-on-primary font-label-sm py-3 px-4 rounded-lg active:scale-95 transition-transform duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Finalizar
          </button>
        </div>
      </main>
    </div>
  );
}
