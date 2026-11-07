import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function Schools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const initialTab = searchParams.get('tab') || 'primary';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Import state
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [showImport, setShowImport] = useState(false); 

  // Add / Edit state
  const [editingSchool, setEditingSchool] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [schoolForm, setSchoolForm] = useState({
    code: '', name: '', category: 'public_primary', zone: '', upnCode: '', county: 'Kitui', subCounty: 'Kitui West', principalName: '', principalPhone: ''
  });

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSchools = () => {
    api.get('/schools')
      .then(res => setSchools(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchools(); }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSearchTerm('');
  };

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

  // --- Add / Edit Logic ---
  const openAddModal = () => {
    setIsAdding(true);
    
    // Auto-select category based on active tab
    let defaultCat = 'public_primary';
    if (activeTab === 'private') defaultCat = 'private_primary';
    if (activeTab === 'secondary') defaultCat = 'secondary';
    if (activeTab === 'special') defaultCat = 'special';

    setSchoolForm({ 
      code: '', name: '', category: defaultCat, zone: '', upnCode: '', county: 'Kitui', subCounty: 'Kitui West', principalName: '', principalPhone: '' 
    });
    setEditingSchool({});
  };

  const openEditModal = (school) => {
    setIsAdding(false);
    setSchoolForm(school);
    setEditingSchool(school);
  };

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await api.post('/schools/import', { schools: [schoolForm] }); 
      } else {
        await api.put(`/schools/${editingSchool._id}`, schoolForm);
      }
      setEditingSchool(null);
      fetchSchools();
    } catch (err) {
      alert(isAdding ? 'Failed to add school' : 'Failed to update school');
    }
  };

  // --- Delete Logic ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/schools/${id}`);
        fetchSchools();
      } catch (err) {
        alert('Failed to delete school');
      }
    }
  };

  const handleDeleteAll = async () => {
    const confirmText = prompt(`WARNING: This will delete ALL ${activeTab.toUpperCase()} schools.\n\nType DELETE to confirm.`);
    if (confirmText === 'DELETE') {
      try {
        await api.delete(`/schools/delete-all?category=${activeTab}`); 
        alert(`All ${activeTab} schools have been deleted.`);
        fetchSchools();
      } catch (err) {
        alert('Failed to delete. Endpoint may not exist yet.');
      }
    }
  };

  // --- Filter Logic ---
  const filteredSchools = schools.filter(school => {
    const cat = (school.category || "").toLowerCase();

    // 1. Filter by Tab Category
    if (activeTab === 'primary') {
      if (!cat.includes('public_primary') && !cat.includes('primary')) return false;
      // Make sure it doesn't include private
      if (cat.includes('private')) return false;
    } 
    else if (activeTab === 'private') {
      if (!cat.includes('private')) return false;
    }
    else if (activeTab === 'secondary') {
      if (!cat.includes('secondary') && !cat.includes('junior')) return false;
    }
    else if (activeTab === 'special') {
      if (!cat.includes('special')) return false;
    }

    // 2. Filter by Search
    const search = searchTerm.toLowerCase();
    const name = (school.name || "").toLowerCase();
    const code = (school.code || "").toLowerCase();
    const upn = (school.upnCode || "").toLowerCase();

    return name.includes(search) || code.includes(search) || upn.includes(search);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Schools Registry</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered schools categorized by level.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleDeleteAll} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded text-sm hover:bg-red-100 font-medium transition-colors">
            Delete All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
          <button onClick={() => setShowImport(!showImport)} className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 font-medium">
            {showImport ? 'Cancel Import' : '📄 Import Excel'}
          </button>
          <button onClick={openAddModal} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 font-medium">
            + Add School
          </button>
          <Link to="/directory" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 font-medium">
            Zonal Directory →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4 overflow-x-auto">
        <button
          onClick={() => handleTabChange('primary')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'primary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Public Primary
        </button>
        <button
          onClick={() => handleTabChange('private')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'private' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Private Schools
        </button>
        <button
          onClick={() => handleTabChange('secondary')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'secondary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Secondary Schools
        </button>
        <button
          onClick={() => handleTabChange('special')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'special' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Special Schools
        </button>
      </div>

      {/* Collapsible Import Section */}
      {showImport && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 border-t-4 border-t-blue-500">
          <h2 className="text-sm font-bold mb-2">Bulk Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Schools</h2>
          <p className="text-xs text-gray-600 mb-3">
            Ensure your Excel file contains the correct categories.
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

      {/* Add / Edit Modal */}
      {editingSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">{isAdding ? 'Add New School' : 'Edit School Data'}</h2>
            <form onSubmit={handleSaveSchool}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code</label>
                  <input required type="text" value={schoolForm.code} onChange={e => setSchoolForm({...schoolForm, code: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School UPN Code</label>
                  <input type="text" value={schoolForm.upnCode || ''} onChange={e => setSchoolForm({...schoolForm, upnCode: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input required type="text" value={schoolForm.name} onChange={e => setSchoolForm({...schoolForm, name: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                  <input type="text" value={schoolForm.county || ''} onChange={e => setSchoolForm({...schoolForm, county: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub County</label>
                  <input type="text" value={schoolForm.subCounty || ''} onChange={e => setSchoolForm({...schoolForm, subCounty: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    required 
                    value={schoolForm.category} 
                    onChange={e => setSchoolForm({...schoolForm, category: e.target.value})} 
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="public_primary">Public Primary</option>
                    <option value="private_primary">Private Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <input required type="text" placeholder="e.g. Tulia, Kauwi" value={schoolForm.zone} onChange={e => setSchoolForm({...schoolForm, zone: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal / HOI Name</label>
                  <input type="text" placeholder="e.g. John Doe" value={schoolForm.principalName || ''} onChange={e => setSchoolForm({...schoolForm, principalName: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal / HOI Phone</label>
                  <input type="text" placeholder="e.g. 0712345678" value={schoolForm.principalPhone || ''} onChange={e => setSchoolForm({...schoolForm, principalPhone: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => setEditingSchool(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                  {isAdding ? 'Save New School' : 'Save Changes'}
                </button>
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

          <div className="p-3 border-b bg-gray-50 flex justify-between items-center rounded-t-lg">
            <input 
              type="text" 
              placeholder="Search by name, code, or UPN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border rounded-md w-full sm:w-64 text-sm"
            />
            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredSchools.length} schools
            </div>
          </div>

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
                      <button onClick={() => openEditModal(school)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                      <button onClick={() => handleDelete(school._id, school.name)} className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSchools.length === 0 && (
            <p className="p-6 text-center text-gray-500 text-sm">
              No schools found for this category.
            </p>
          )}
        </div>
      )}
    </div>
  );
}