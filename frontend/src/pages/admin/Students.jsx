import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { Plus, Search, Upload } from 'lucide-react';

export default function Students() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ unique_code: '', name: '', grade: '' });

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await api.get('/students')).data
  });

  const fileInputRef = useRef(null);

  const createMutation = useMutation({
    mutationFn: async (data) => api.post('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowModal(false);
      setFormData({ unique_code: '', name: '', grade: '' });
    }
  });

  const bulkMutation = useMutation({
    mutationFn: async (students) => api.post('/students/bulk', { students }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert(res.data.message);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Error en la importación masiva');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const students = data.map(row => ({
        unique_code: String(row.Codigo || row.unique_code || ''),
        name: row.Nombre || row.name || '',
        grade: String(row.Curso || row.grade || ''),
        birth_date: row.FechaNacimiento || row.birth_date ? String(row.FechaNacimiento || row.birth_date) : null
      })).filter(s => s.unique_code && s.name && s.grade);

      if (students.length > 0) {
        if(window.confirm(`¿Estás seguro de importar ${students.length} estudiantes?`)) {
          bulkMutation.mutate(students);
        }
      } else {
        alert('No se encontraron estudiantes válidos en el archivo. Verifica las columnas (Codigo, Nombre, Curso, FechaNacimiento).');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-500">Gestión del padrón electoral</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-50 hover:bg-green-100 text-green-700 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2 border border-green-200"
          >
            <Upload className="w-5 h-5" />
            <span>Importar</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Estudiante</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-3 bg-gray-50">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por código o nombre..." 
            className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Curso</th>
                <th className="p-4 font-medium text-center">Estado Voto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500">Cargando...</td></tr>
              ) : students?.map(student => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{student.unique_code}</td>
                  <td className="p-4 text-gray-600">{student.name}</td>
                  <td className="p-4 text-gray-600">{student.grade}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.has_voted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {student.has_voted ? 'Votó' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Nuevo Estudiante</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Código Único</label>
                <input
                  type="text"
                  required
                  value={formData.unique_code}
                  onChange={e => setFormData({...formData, unique_code: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Curso / Grado</label>
                <input
                  type="text"
                  required
                  value={formData.grade}
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. 11A"
                />
              </div>

              {createMutation.isError && (
                <p className="text-red-500 text-sm">{createMutation.error.response?.data?.message || 'Error al crear'}</p>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
