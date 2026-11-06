import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form builder state
  const [newCollection, setNewCollection] = useState({ name: '', term: '', description: '' });
  const [fields, setFields] = useState([
    { key: 'total_boys', label: 'Total Boys', type: 'number', required: true, group: 'Enrollment' }
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
    // Auto-generate the database key from the label if typing the label
    if (key === 'label') {
      updated[index].key = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
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

    try {
      await api.post('/collections', { ...newCollection, fields });
      setIsCreating(false);
      setNewCollection({ name: '', term: '', description: '' });
      setFields([{ key: 'total_boys', label: 'Total Boys', type: 'number', required: true, group: 'Enrollment' }]);
      fetchCollections();
    } catch (err) {
      alert('Failed to create form');
    }
  };

  const toggleStatus = async (id) => {
    await api.patch(`/collections/${id}/status`);
    fetchCollections();
  };

  // --- Export Excel ---
  const downloadExcel = async (id, name) => {
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
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Collections</h1>
        <div className="flex gap-4">
          <button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {isCreating ? 'Cancel' : '+ Create New Form'}
          </button>
          <Link to="/" className="text-blue-600 hover:underline py-2">← Dashboard</Link>
        </div>
      </div>

      {/* CREATE FORM BUILDER */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-t-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4">Form Builder</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-1">Form Name</label>
                <input required type="text" placeholder="e.g. Term 1 Enrollment" value={newCollection.name} onChange={e => setNewCollection({...newCollection, name: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Term / Year</label>
                <input required type="text" placeholder="e.g. 2025-T1" value={newCollection.term} onChange={e => setNewCollection({...newCollection, term: e.target.value})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description (Optional)</label>
                <input type="text" placeholder="Instructions for schools" value={newCollection.description} onChange={e => setNewCollection({...newCollection, description: e.target.value})} className="w-full p-2 border rounded" />
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2 border-b pb-2">Form Fields</h3>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 items-end mb-2 bg-gray-50 p-2 rounded">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Group (e.g. Enrollment)</label>
                  <input type="text" value={field.group} onChange={e => updateField(index, 'group', e.target.value)} className="w-full p-1 border rounded text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Label (What schools see)</label>
                  <input required type="text" value={field.label} onChange={e => updateField(index, 'label', e.target.value)} className="w-full p-1 border rounded text-sm" />
                </div>
                <div className="w-32">
                  <label className="text-xs text-gray-500">Type</label>
                  <select value={field.type} onChange={e => updateField(index, 'type', e.target.value)} className="w-full p-1 border rounded text-sm">
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                  </select>
                </div>
                <div className="flex items-center mb-1">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(index, 'required', e.target.checked)} className="mr-1" />
                  <span className="text-sm">Req</span>
                </div>
                <button type="button" onClick={() => removeField(index)} className="text-red-500 font-bold px-2 py-1 mb-1 hover:bg-red-100 rounded">X</button>
              </div>
            ))}
            
            <button type="button" onClick={addField} className="mt-2 text-blue-600 font-bold text-sm hover:underline">+ Add Field</button>

            <div className="mt-6 pt-4 border-t">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Save Form</button>
            </div>
          </form>
        </div>
      )}

      {/* COLLECTIONS LIST */}
      {loading ? <p>Loading forms...</p> : (
        <div className="grid gap-4">
          {collections.map(col => {
            const publicLink = `${window.location.origin}/form/${col.publicSlug}`;
            return (
              <div key={col._id} className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{col.name} <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">{col.term}</span></h2>
                    <p className="text-gray-600 text-sm mt-1">{col.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(col._id)} className={`px-3 py-1 rounded text-sm font-bold ${col.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {col.status === 'open' ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-800 font-bold mb-1">PUBLIC LINK FOR SCHOOLS:</p>
                    <code className="text-sm text-blue-900 select-all">{publicLink}</code>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(publicLink); alert('Link copied!'); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Copy Link</button>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Link to={`/submissions/${col._id}`} className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900">View Submissions</Link>
                  <button onClick={() => downloadExcel(col._id, col.name)} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Export to Excel</button>
                </div>
              </div>
            );
          })}
          {collections.length === 0 && <p className="text-gray-500">No forms created yet.</p>}
        </div>
      )}
    </div>
  );
}
