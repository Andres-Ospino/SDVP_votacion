import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, User, X } from 'lucide-react';

export default function Candidates() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    number: '',
    proposal: '',
    status: 'ACTIVE',
    image: null
  });

  const [selectedElectionId, setSelectedElectionId] = useState('');

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['adminCandidates', selectedElectionId],
    queryFn: async () => (await api.get(`/candidates${selectedElectionId ? `?electionId=${selectedElectionId}` : ''}`)).data
  });

  // Query to get active election to assign candidate to
  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => (await api.get('/elections')).data
  });
  
  const activeElection = elections?.find(e => e.is_active);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const formPayload = new FormData();
      formPayload.append('name', data.name);
      formPayload.append('grade', data.grade);
      formPayload.append('number', data.number);
      formPayload.append('proposal', data.proposal);
      formPayload.append('status', data.status);
      if (activeElection && !editingCandidate) {
        formPayload.append('election_id', activeElection.id);
      }
      if (data.image) {
        formPayload.append('image', data.image);
      }

      if (editingCandidate) {
        return api.put(`/candidates/${editingCandidate.id}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        return api.post('/candidates', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCandidates'] });
      handleCloseModal();
    }
  });

  const handleOpenModal = (candidate = null) => {
    if (candidate) {
      setEditingCandidate(candidate);
      setFormData({
        name: candidate.name,
        grade: candidate.grade,
        number: candidate.number,
        proposal: candidate.proposal || '',
        status: candidate.status,
        image: null
      });
    } else {
      if (!activeElection) {
        alert("Debe haber una elección activa para agregar un candidato.");
        return;
      }
      setEditingCandidate(null);
      setFormData({
        name: '',
        grade: '',
        number: '',
        proposal: '',
        status: 'ACTIVE',
        image: null
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCandidate(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
            {elections && elections.length > 0 && (
              <select 
                value={selectedElectionId} 
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todas las Elecciones</option>
                {elections.map(election => (
                  <option key={election.id} value={election.id}>
                    {election.title} {election.is_active ? '(Activa)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-gray-500">Administración de candidatos electorales</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Candidato</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500 py-8">Cargando...</div>
        ) : candidates?.map(candidate => (
          <div key={candidate.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="aspect-square bg-gray-50 relative">
              {candidate.image_url ? (
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${candidate.image_url}`} alt={candidate.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-900 shadow-sm">
                {candidate.number}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{candidate.name}</h3>
              <p className="text-blue-600 text-sm font-medium mb-3">Curso {candidate.grade}</p>
              <div className="flex-1"></div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {candidate.status}
                </span>
                <button 
                  onClick={() => handleOpenModal(candidate)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCandidate ? 'Editar Candidato' : 'Nuevo Candidato'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                  <input 
                    type="text" 
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input 
                    type="text" 
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propuesta Principal</label>
                <textarea 
                  value={formData.proposal}
                  onChange={e => setFormData({...formData, proposal: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (Opcional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setFormData({...formData, image: e.target.files[0]})}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors mt-6 disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Guardando...' : 'Guardar Candidato'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
