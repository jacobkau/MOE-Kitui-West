import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Import state
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  // Edit state
  const [editingSchool, setEditingSchool] = useState(null);

  const fetchSchools = () => {
    api.get('/schools')
      .then(res => setSchools(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchools(); }, []);

  // --- Import Logic ---
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      setMessage('Parsing file...');
      const res = await api.post('/schools/upload-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreviewData(res.data);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to parse file');
    }
  };

  const confirmImport = async () => {
    if (!previewData || previewData.parsed.length === 0) return;
    setImporting(true);
    try {
      await api.post('/schools/import', { schools: previewData.parsed });
      setMessage(`Successfully imported ${previewData.parsed.length} schools!`);
      setPreviewData(null);
      setFile(null);
      fetchSchools();
    } catch (err) {
      setMessage('Import failed.');
    } finally {
      setImporting(false);
    }
  };

  // --- Edit Logic ---
  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/schools/${editingSchool._id}`, editingSchool);
      setEditingSchool(null);
      fetchSchools();
    } catch (err) {
      alert('Failed to update school');
    }
  };

  // --- Delete Logic ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        await api.delete(`/schools/${id}`);
        fetchSchools();
      } catch (err) {
        alert('Failed to delete school');
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Schools Registry</h1>
        <div className="flex gap-4">
          <Link to="/directory" className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-medium transition-colors">
            View Zonal Directory →
          </Link>
          <Link to="/" className="text-gray-500 hover:text-gray-800 py-2">← Back</Link>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 border-t-4 border-t-blue-500">
        <h2 className="text-lg font-bold mb-2">Bulk Import Schools (Excel / CSV)</h2>
        <p className="text-sm text-gray-600 mb-4">Upload a file with columns: <strong>code, name, category, zone</strong>.</p>
        
        {!previewData ? (
          <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        ) : (
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-bold text-gray-800 mb-2">Preview ({previewData.parsed.length} valid rows)</h3>
            {previewData.errors.length > 0 && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm max-h-32 overflow-y-auto">
                <p className="font-bold">Errors found:</p>
                <ul>{previewData.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={confirmImport} disabled={importing} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium text-sm">
                {importing ? 'Importing...' : 'Confirm Import'}
              </button>
              <button onClick={() => { setPreviewData(null); setFile(null); }} className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium text-sm">Cancel</button>
            </div>
          </div>
        )}
        {message && <p className="mt-4 text-blue-600 font-medium text-sm">{message}</p>}
      </div>

      {/* Edit Modal Overlay */}
      {editingSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit School</h2>
            <form onSubmit={handleUpdateSchool}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code</label>
                  <input required type="text" value={editingSchool.code} onChange={e => setEditingSchool({...editingSchool, code: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input required type="text" value={editingSchool.name} onChange={e => setEditingSchool({...editingSchool, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={editingSchool.category} onChange={e => setEditingSchool({...editingSchool, category: e.target.value})} className="w-full p-2 border rounded">
                    <option value="public_primary">Public Primary</option>
                    <option value="private_primary">Private Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <select value={editingSchool.zone} onChange={e => setEditingSchool({...editingSchool, zone: e.target.value})} className="w-full p-2 border rounded">
                    <option value="Central">Central</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingSchool(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schools Table */}
      {loading ? (
        <p>Loading schools...</p>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Code</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Zone</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map(school => (
                <tr key={school._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium">{school.code}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{school.name}</td>
                  <td className="p-4 text-sm capitalize">{school.category.replace('_', ' ')}</td>
                  <td className="p-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{school.zone}</span>
                  </td>
                  <td className="p-4 text-sm text-right space-x-3">
                    <button onClick={() => setEditingSchool(school)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => handleDelete(school._id, school.name)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {schools.length === 0 && <p className="p-8 text-center text-gray-500">No schools found.</p>}
        </div>
      )}
    </div>
  );
}
