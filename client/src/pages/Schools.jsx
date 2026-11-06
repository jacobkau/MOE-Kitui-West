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

  const fetchSchools = () => {
    api.get('/schools')
      .then(res => setSchools(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchools(); }, []);

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
      fetchSchools(); // refresh list
    } catch (err) {
      setMessage('Import failed. Check console.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Schools Registry</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Dashboard</Link>
      </div>

      {/* Import Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 border-t-4 border-blue-500">
        <h2 className="text-lg font-bold mb-2">Import Schools (Excel / CSV)</h2>
        <p className="text-sm text-gray-600 mb-4">Upload a file with columns: <strong>code, name, category, zone</strong> (Categories: public_primary, private_primary, secondary. Zones: Central, North, South, East).</p>
        
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
            
            <div className="max-h-60 overflow-y-auto mb-4 border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr><th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Category</th><th className="p-2">Zone</th></tr>
                </thead>
                <tbody>
                  {previewData.parsed.map((row, i) => (
                    <tr key={i} className="border-b"><td className="p-2">{row.code}</td><td className="p-2">{row.name}</td><td className="p-2">{row.category}</td><td className="p-2">{row.zone}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex gap-2">
              <button onClick={confirmImport} disabled={importing} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                {importing ? 'Importing...' : 'Confirm Import'}
              </button>
              <button onClick={() => { setPreviewData(null); setFile(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        )}
        {message && <p className="mt-4 text-blue-600 font-medium">{message}</p>}
      </div>

      {/* Schools Table */}
      {loading ? (
        <p>Loading schools...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Code</th>
                <th className="p-4 font-semibold text-gray-600">Name</th>
                <th className="p-4 font-semibold text-gray-600">Category</th>
                <th className="p-4 font-semibold text-gray-600">Zone</th>
              </tr>
            </thead>
            <tbody>
              {schools.map(school => (
                <tr key={school._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{school.code}</td>
                  <td className="p-4 font-medium">{school.name}</td>
                  <td className="p-4 capitalize">{school.category.replace('_', ' ')}</td>
                  <td className="p-4">{school.zone}</td>
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
