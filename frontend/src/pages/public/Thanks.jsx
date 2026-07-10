import { useEffect } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center space-y-8 relative z-10 border border-white/50">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 hover:scale-110 hover:rotate-12 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">¡Voto Registrado!</h2>
          <p className="text-gray-600 text-lg">
            Gracias por participar. Tu decisión es fundamental para el futuro de nuestra comunidad educativa.
          </p>
          {receiptId && (
            <p className="text-sm font-mono text-gray-400 bg-gray-50 py-2 rounded-lg border border-gray-100">
              ID: {receiptId}
            </p>
          )}
        </div>

        <div className="pt-4 space-y-3">
          {receiptId && (
            <button
              onClick={downloadReceipt}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Descargar Comprobante</span>
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-gray-900/20"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
