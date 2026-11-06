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
  const [showImport, setShowImport] = useState(false); // Toggle for import section

  // Edit state
  const [editingSchool, setEditingSchool] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      setShowImport(false);
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

  // --- Filter Logic ---
  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (school.upnCode && school.upnCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || school.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Schools Registry</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the 123 registered schools across the sub-county.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImport(!showImport)} 
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 font-medium"
          >
            {showImport ? 'Hide Import' : '📄 Import Excel'}
          </button>
          <Link to="/directory" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 font-medium">
            Zonal Directory →
          </Link>
        </div>
      </div>

      {/* Collapsible Import Section */}
      {showImport && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 border-t-4 border-t-blue-500">
          <h2 className="text-sm font-bold mb-2">Bulk Import Schools (Excel / CSV)</h2>
          <p className="text-xs text-gray-600 mb-3">
            Columns: <strong>code, name, category, zone, upnCode, county, subCounty, principalName, principalPhone</strong>.
          </p>
          
          {!previewData ? (
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          ) : (
            <div className="bg-gray-50 p-3 rounded border">
              <h3 className="font-bold text-gray-800 mb-1 text-sm">Preview ({previewData.parsed.length} valid rows)</h3>
              {previewData.errors.length > 0 && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-xs max-h-24 overflow-y-auto">
                  <p className="font-bold">Errors found:</p>
                  <ul>{previewData.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={confirmImport} disabled={importing} className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium text-xs">
                  {importing ? 'Importing...' : 'Confirm Import'}
                </button>
                <button onClick={() => { setPreviewData(null); setFile(null); }} className="bg-gray-300 text-gray-800 px-3 py-1.5 rounded font-medium text-xs">Cancel</button>
              </div>
            </div>
          )}
          {message && <p className="mt-2 text-blue-600 font-medium text-xs">{message}</p>}
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">Edit School Data</h2>
            <form onSubmit={handleUpdateSchool}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code</label>
                  <input required type="text" value={editingSchool.code} onChange={e => setEditingSchool({...editingSchool, code: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School UPN Code</label>
                  <input type="text" value={editingSchool.upnCode || ''} onChange={e => setEditingSchool({...editingSchool, upnCode: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input required type="text" value={editingSchool.name} onChange={e => setEditingSchool({...editingSchool, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <input type="text" value={editingSchool.county || ''} onChange={e => setEditingSchool({...editingSchool, county: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub County</label>
                  <input type="text" value={editingSchool.subCounty || ''} onChange={e => setEditingSchool({...editingSchool, subCounty: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input required type="text" placeholder="e.g. public_primary" value={editingSchool.category} onChange={e => setEditingSchool({...editingSchool, category: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <input required type="text" placeholder="e.g. Tulia, Kauwi" value={editingSchool.zone} onChange={e => setEditingSchool({...editingSchool, zone: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal / HOI Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={editingSchool.principalName || ''} onChange={e => setEditingSchool({...editingSchool, principalName: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal / HOI Phone</label>
                  <input type="text" placeholder="e.g. 0712345678" value={editingSchool.principalPhone || ''} onChange={e => setEditingSchool({...editingSchool, principalPhone: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => setEditingSchool(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schools Table Section */}
      {loading ? (
        <p>Loading schools...</p>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          
          {/* Search & Filter Toolbar */}
          <div className="p-3 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-t-lg">
            <div className="flex gap-3 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Search by name, code, or UPN..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border rounded-md focus:ring-1 focus:ring-blue-500 w-full sm:w-64 text-sm"
              />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-md focus:ring-1 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">All Categories</option>
                <option value="public_primary">Public Primary</option>
                <option value="private_primary">Private Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredSchools.length} of {schools.length} schools
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left relative">
              <thead className="bg-gray-100 border-b sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 font-semibold text-gray-600 text-xs w-12 text-center">#</th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">Code / UPN</th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">School Name & Location</th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">Category</th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">Zone / Principal</th>
                  <th className="p-3 font-semibold text-gray-600 text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school, index) => (
                  <tr key={school._id} className="border-b hover:bg-gray-50">
                    {/* NUMBERING COLUMN */}
                    <td className="p-3 text-sm text-gray-400 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="p-3 text-sm font-medium align-top">
                      {school.code}
                      {school.upnCode && <div className="text-xs text-gray-400 mt-0.5">UPN: {school.upnCode}</div>}
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-800 align-top">
                      {school.name}
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{school.county} County, {school.subCounty}</div>
                    </td>
                    <td className="p-3 text-sm align-top">
                      <span className="capitalize px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {school.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm align-top">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{school.zone}</span>
                      {school.principalName && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-semibold text-gray-700">HOI:</span> {school.principalName}
                          {school.principalPhone && <div>{school.principalPhone}</div>}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm text-right space-x-2 align-top">
                      <button onClick={() => setEditingSchool(school)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                      <button onClick={() => handleDelete(school._id, school.name)} className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSchools.length === 0 && (
            <p className="p-6 text-center text-gray-500 text-sm">
              No schools match your search criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
