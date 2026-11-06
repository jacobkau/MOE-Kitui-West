import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status & Loading states
  const [togglingId, setTogglingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Form builder state
  const [editingId, setEditingId] = useState(null);
  const [newCollection, setNewCollection] = useState({ 
    name: '', term: '', description: '', targetCategory: 'all' 
  });
  const [fields, setFields] = useState([
    { key: 'general_total_boys', label: 'Total Boys', type: 'number', required: true, group: 'General' }
  ]);

  const fetchCollections = () => {
    api.get('/collections')
      .then(res => {
        // Sort by createdAt descending (newest first)
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCollections(sorted);
      })
      .finally(() => setLoading(false));
  };

  // LIVE UPDATE: Fetch every 8 seconds
  useEffect(() => { 
    fetchCollections(); 
    const intervalId = setInterval(fetchCollections, 8000);
    return () => clearInterval(intervalId);
  }, []);

  const addField = () => {
    setFields([...fields, { key: '', label: '', type: 'number', required: false, group: 'General' }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    if (key === 'label' || key === 'group') {
      const groupStr = updated[index].group ? updated[index].group.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'general';
      const labelStr = updated[index].label ? updated[index].label.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'field';
      updated[index].key = `${groupStr}_${labelStr}`;
    }
    setFields(updated);
  };

  const removeField = (index) => setFields(fields.filter((_, i) => i !== index));

  const handleEditClick = (col) => {
    setEditingId(col._id);
    setNewCollection({ 
      name: col.name, 
      term: col.term, 
      description: col.description || '', 
      targetCategory: col.targetCategory || 'all' 
    });
    setFields(col.fields);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setNewCollection({ name: '', term: '', description: '', targetCategory: 'all' });
    setFields([{ key: 'general_total_boys', label: 'Total Boys', type: 'number', required: true, group: 'General' }]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (fields.length === 0) return alert("Add at least one field.");
    if (fields.some(f => !f.label || !f.key)) return alert("All fields must have a label.");

    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/collections/${editingId}`, { ...newCollection, fields });
      } else {
        await api.post('/collections', { ...newCollection, fields });
      }
      handleCancel();
      fetchCollections();
    } catch (err) {
      alert(editingId ? 'Failed to update form.' : 'Failed to create form');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleDeleteForm = async (id, name) => {
    if (!window.confirm(`WARNING: Delete form "${name}" and all its submissions?`)) return;
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

  // SAFE FILTER LOGIC
  const filteredCollections = collections.filter(col => {
    const name = (col.name || "").toLowerCase();
    const term = (col.term || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || term.includes(search);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Collections</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">Create forms and manage data.</p>
            <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span></span>
              LIVE
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => isCreating ? handleCancel() : setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium transition-colors">
            {isCreating ? 'Cancel' : '+ Create New Form'}
          </button>
          <Link to="/" className="text-gray-500 hover:text-gray-800 py-2 text-sm font-medium">← Dashboard</Link>
        </div>
      </div>

      {!isCreating && (
        <div className="mb-4">
          <input type="text" placeholder="Search forms by name or term..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
      )}

      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Form' : 'Form Builder'}</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                <input required type="text" placeholder="e.g. Term 1" value={newCollection.name} onChange={e => setNewCollection({...newCollection, name: e.target.value})} className="w-full p-2 border rounded-md" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Term / Year</label>
                <input required type="text" placeholder="e.g. 2025-T1" value={newCollection.term} onChange={e => setNewCollection({...newCollection, term: e.target.value})} className="w-full p-2 border rounded-md" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select value={newCollection.targetCategory} onChange={e => setNewCollection({...newCollection, targetCategory: e.target.value})} className="w-full p-2 border rounded-md bg-white">
                  <option value="all">All Schools</option>
                  <option value="primary">Primary Only</option>
                  <option value="private">Private Only</option>
                  <option value="secondary">Secondary Only</option>
                  <option value="special">Special Only</option>
                  <option value="primary_private">Primary & Private Only</option>
                  <option value="primary_secondary">Primary & Secondary Only</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" placeholder="Optional" value={newCollection.description} onChange={e => setNewCollection({...newCollection, description: e.target.value})} className="w-full p-2 border rounded-md" />
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">Form Fields</h3>
            {fields.map((field, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-3 bg-gray-50 p-3 rounded border">
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Group</label>
                  <input type="text" placeholder="e.g. Grade 1" value={field.group} onChange={e => updateField(index, 'group', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Label</label>
                  <input required type="text" placeholder="e.g. Total Girls" value={field.label} onChange={e => updateField(index, 'label', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                </div>
                <div className="w-full md:w-auto">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                  <div className="flex bg-white rounded-md border overflow-hidden">
                    <button type="button" onClick={() => updateField(index, 'type', 'number')} className={`px-3 py-2 text-xs font-medium border-r ${field.type === 'number' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Number</button>
                    <button type="button" onClick={() => updateField(index, 'type', 'text')} className={`px-3 py-2 text-xs font-medium border-r ${field.type === 'text' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Text</button>
                    <button type="button" onClick={() => updateField(index, 'type', 'textarea')} className={`px-3 py-2 text-xs font-medium ${field.type === 'textarea' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Long</button>
                  </div>
                </div>
                <div className="flex items-center h-full pt-4">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(index, 'required', e.target.checked)} className="w-4 h-4 mr-2 text-blue-600 rounded" />
                  <span className="text-xs font-medium text-gray-700">Req</span>
                </div>
                <button type="button" onClick={() => removeField(index)} className="text-red-500 font-bold px-3 py-2 hover:bg-red-100 rounded-md mt-4 md:mt-0">✕</button>
              </div>
            ))}
            <button type="button" onClick={addField} className="mt-2 text-blue-600 font-bold text-sm hover:underline">+ Add Field</button>

            <div className="mt-6 pt-4 border-t flex gap-3">
              <button type="submit" disabled={isSaving} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                {isSaving ? 'Saving...' : (editingId ? 'Update Form' : 'Save Form')}
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Loading forms...</p> : (
        <div className="flex flex-col gap-2">
          {filteredCollections.map((col, index) => {
            const publicLink = `${window.location.origin}/form/${col.publicSlug}`;
            const dateStr = new Date(col.createdAt).toLocaleDateString();
            
            return (
              <div key={col._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-300 transition-colors">
                
                {/* Left Side: Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-800">{col.name}</h2>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{col.term}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${col.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {col.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>Created: {dateStr}</span>
                      <span>Target: {col.targetCategory?.replace(/_/g, ' & ').toUpperCase() || 'ALL'}</span>
                      <span className="font-bold text-blue-600">{col.submissionCount || 0} Submissions</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button onClick={() => { navigator.clipboard.writeText(publicLink); alert('Link copied!'); }} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded font-medium border border-blue-200">Copy Link</button>
                  <Link to={`/submissions/${col._id}`} className="text-xs text-gray-700 hover:bg-gray-100 px-2 py-1.5 rounded font-medium border border-gray-300">Submissions</Link>
                  <button onClick={() => downloadExcel(col._id, col.name)} disabled={exportingId === col._id} className="text-xs text-green-700 hover:bg-green-50 px-2 py-1.5 rounded font-medium border border-green-200 disabled:opacity-50">
                    {exportingId === col._id ? '...' : 'Excel'}
                  </button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>
                  
                  <button onClick={() => handleEditClick(col)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded font-medium">Edit</button>
                  <button onClick={() => toggleStatus(col._id, col.status)} disabled={togglingId === col._id} className={`text-xs px-2 py-1.5 rounded font-medium disabled:opacity-50 ${col.status === 'open' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}>
                    {togglingId === col._id ? '...' : col.status === 'open' ? 'Close' : 'Reopen'}
                  </button>
                  <button onClick={() => handleDeleteForm(col._id, col.name)} disabled={deletingId === col._id} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1.5 rounded font-medium disabled:opacity-50">
                    {deletingId === col._id ? '...' : 'Delete'}
                  </button>
                </div>

              </div>
            );
          })}
          {filteredCollections.length === 0 && <p className="text-gray-500 text-center py-8">No forms found.</p>}
        </div>
      )}
    </div>
  );
}
