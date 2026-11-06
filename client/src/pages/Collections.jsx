import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Status & Loading states
  const [togglingId, setTogglingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Form builder state
  const [newCollection, setNewCollection] = useState({ name: '', term: '', description: '' });
  const [fields, setFields] = useState([
    { key: 'general_total_boys', label: 'Total Boys', type: 'number', required: true, group: 'General' }
  ]);

  const fetchCollections = () => {
    api.get('/collections')
      .then(res => setCollections(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCollections(); }, []);

  // --- Dynamic Fields Logic ---
  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'number', required: false, group: 'General' }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    
    // FIX: Generate a unique key using BOTH group and label
    if (key === 'label' || key === 'group') {
      const groupStr = updated[index].group ? updated[index].group.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'general';
      const labelStr = updated[index].label ? updated[index].label.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'field';
      updated[index].key = `${groupStr}_${labelStr}`;
    }
    setFields(updated);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // --- Create Form ---
  const handleCreate = async (e) => {
    e.preventDefault();
    if (fields.length === 0) return alert("Add at least one field.");
    if (fields.some(f => !f.label || !f.key)) return alert("All fields must have a label.");

    setIsSaving(true);
    try {
      await api.post('/collections', { ...newCollection, fields });
      setIsCreating(false);
      setNewCollection({ name: '', term: '', description: '' });
      setFields([{ key: 'general_total_boys', label: 'Total Boys', type: 'number', required: true, group: 'General' }]);
      fetchCollections();
    } catch (err) {
      alert('Failed to create form');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Toggle Open/Close ---
  const toggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'open' ? 'CLOSE' : 'REOPEN';
    if (!window.confirm(`Are you sure you want to ${action} this form?`)) return;

    setTogglingId(id);
    try {
      await api.patch(`/collections/${id}/status`);
      fetchCollections();
    } catch (err) {
      alert("Failed to change status");
    } finally {
      setTogglingId(null);
    }
  };

  // --- Delete Form ---
  const handleDeleteForm = async (id, name) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete the form "${name}"? This will also delete all associated submissions!`)) return;

    setDeletingId(id);
    try {
      await api.delete(`/collections/${id}`);
      fetchCollections();
    } catch (err) {
      alert("Failed to delete form.");
    } finally {
      setDeletingId(null);
    }
  };

  // --- Export Excel ---
  const downloadExcel = async (id, name) => {
    setExportingId(id);
    try {
      const res = await api.get(`/exports/excel/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export failed. Make sure there are submissions.");
    } finally {
      setExportingId(null);
    }
  };

  // Filter forms by search
  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    col.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Create forms and manage data submissions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCreating(!isCreating)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium transition-colors"
          >
            {isCreating ? 'Cancel' : '+ Create New Form'}
          </button>
          <Link to="/" className="text-gray-500 hover:text-gray-800 py-2 text-sm font-medium">← Dashboard</Link>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search forms by name or term..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* CREATE FORM BUILDER */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold mb-4">Form Builder</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                <input required type="text" placeholder="e.g. Term 1 Enrollment" value={newCollection.name} onChange={e => setNewCollection({...newCollection, name: e.target.value})} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term / Year</label>
                <input required type="text" placeholder="e.g. 2025-T1" value={newCollection.term} onChange={e => setNewCollection({...newCollection, term: e.target.value})} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input type="text" placeholder="Instructions" value={newCollection.description} onChange={e => setNewCollection({...newCollection, description: e.target.value})} className="w-full p-2 border rounded-md" />
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">Form Fields</h3>
            <p className="text-xs text-gray-500 mb-4">Tip: Group fields together to create sections (e.g., group "Grade 1" for Grade 1 Boys and Grade 1 Girls).</p>
            
            {fields.map((field, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-3 bg-gray-50 p-3 rounded border">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Group Name</label>
                  <input type="text" placeholder="e.g. Grade 1" value={field.group} onChange={e => updateField(index, 'group', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Label (What schools see)</label>
                  <input required type="text" placeholder="e.g. Total Girls" value={field.label} onChange={e => updateField(index, 'label', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                </div>
                
                <div className="w-full md:w-auto">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Data Type</label>
                  <div className="flex bg-white rounded-md border overflow-hidden">
                    <button type="button" onClick={() => updateField(index, 'type', 'number')} className={`px-3 py-2 text-xs font-medium border-r ${field.type === 'number' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Number</button>
                    <button type="button" onClick={() => updateField(index, 'type', 'text')} className={`px-3 py-2 text-xs font-medium border-r ${field.type === 'text' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Text</button>
                    <button type="button" onClick={() => updateField(index, 'type', 'textarea')} className={`px-3 py-2 text-xs font-medium ${field.type === 'textarea' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>Long Text</button>
                  </div>
                </div>

                <div className="flex items-center h-full pt-4">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(index, 'required', e.target.checked)} className="w-4 h-4 mr-2 text-blue-600 rounded" />
                  <span className="text-xs font-medium text-gray-700">Required</span>
                </div>
                
                <button type="button" onClick={() => removeField(index)} className="text-red-500 font-bold px-3 py-2 hover:bg-red-100 rounded-md mt-4 md:mt-0">✕</button>
              </div>
            ))}
            
            <button type="button" onClick={addField} className="mt-2 text-blue-600 font-bold text-sm hover:underline">+ Add Field</button>

            <div className="mt-6 pt-4 border-t">
              <button type="submit" disabled={isSaving} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors">
                {isSaving ? 'Saving Form...' : 'Save Form'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COLLECTIONS LIST */}
      {loading ? <p>Loading forms...</p> : (
        <div className="grid gap-4">
          {filteredCollections.map(col => {
            const publicLink = `${window.location.origin}/form/${col.publicSlug}`;
            return (
              <div key={col._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{col.name} <span className="text-xs font-normal text-gray-600 bg-gray-100 px-2 py-1 rounded ml-2">{col.term}</span></h2>
                    <p className="text-gray-500 text-sm mt-1">{col.description}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => toggleStatus(col._id, col.status)} 
                      disabled={togglingId === col._id}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 ${col.status === 'open' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      {togglingId === col._id ? 'Updating...' : col.status === 'open' ? 'CLOSE FORM' : 'REOPEN FORM'}
                    </button>
                    <button 
                      onClick={() => handleDeleteForm(col._id, col.name)}
                      disabled={deletingId === col._id}
                      className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {deletingId === col._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-md mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <p className="text-xs text-blue-800 font-bold mb-1">PUBLIC LINK FOR SCHOOLS:</p>
                    <code className="text-sm text-blue-900 select-all break-all">{publicLink}</code>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(publicLink); alert('Link copied!'); }} className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 font-medium whitespace-nowrap">Copy Link</button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                  <Link to={`/submissions/${col._id}`} className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900 font-medium">View Submissions</Link>
                  <button 
                    onClick={() => downloadExcel(col._id, col.name)} 
                    disabled={exportingId === col._id}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
                  >
                    {exportingId === col._id ? 'Exporting...' : 'Export to Excel'}
                  </button>
                </div>
              </div>
            );
          })}
          {filteredCollections.length === 0 && <p className="text-gray-500">No forms found matching your search.</p>}
        </div>
      )}
    </div>
  );
}
