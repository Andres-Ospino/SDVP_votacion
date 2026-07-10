import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { Plus, Trash2, Shield } from 'lucide-react';

export default function Admins() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => (await api.get('/admins')).data
  });

  const createMutation = useMutation({
    mutationFn: async (data) => api.post('/admins', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowModal(false);
      setFormData({ name: '', username: '', password: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/admins/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administradores</h1>
          <p className="text-gray-500">Gestión de usuarios del sistema</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">Usuario</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan="3" className="p-4 text-center text-gray-500">Cargando...</td></tr>
              ) : admins?.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>{admin.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">{admin.username}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        if (window.confirm('¿Seguro que deseas eliminar este admin?')) {
                          deleteMutation.mutate(admin.id);
                        }
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <h3 className="text-xl font-bold text-gray-900">Nuevo Administrador</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Usuario</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
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
