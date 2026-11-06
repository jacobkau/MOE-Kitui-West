import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Submissions() {
  const { collectionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Function to fetch data
  const fetchData = async () => {
    try {
      // We only need to fetch collection once, but fetching it again is harmless
      const colRes = await api.get('/collections');
      const currentCol = colRes.data.find(c => c._id === collectionId);
      setCollection(currentCol);
      
      const subRes = await api.get(`/submissions/collection/${collectionId}`);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Setup Live Polling (every 8 seconds)
  useEffect(() => {
    // Fetch immediately on load
    fetchData();

    // Then set an interval to fetch every 8000 milliseconds (8 seconds)
    const intervalId = setInterval(() => {
      fetchData();
    }, 8000);

    // Cleanup the interval when the user leaves the page
    return () => clearInterval(intervalId);
  }, [collectionId]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      setDeletingId(id);
      try {
        await api.delete(`/submissions/${id}`);
        fetchData(); // Instantly refresh after delete
      } catch (err) {
        alert("Failed to delete.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const downloadExcel = async () => {
    setExportingId(collectionId);
    try {
      const res = await api.get(`/exports/excel/${collectionId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${collection.name} Submissions.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export failed. Make sure there are submissions.");
    } finally {
      setExportingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading submissions...</div>;
  if (!collection) return <div className="p-8 text-center text-red-500">Collection not found.</div>;

  const filteredSubmissions = submissions.filter(sub => 
    sub.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.school?.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Submissions: {collection.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">Term: {collection.term} • Total Received: <strong className="text-gray-800">{submissions.length}</strong></p>
            
            {/* Live Indicator */}
            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE
            </span>
          </div>
        </div>
        <Link to="/collections" className="text-blue-600 hover:underline font-medium text-sm">← Back to Forms</Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by school name or code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
        
        <button 
          onClick={downloadExcel} 
          disabled={exportingId === collectionId || submissions.length === 0}
          className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700 font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          {exportingId === collectionId ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          No submissions found.
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-xs w-12 text-center">#</th>
                <th className="p-4 font-semibold text-gray-600 text-xs">School Details</th>
                <th className="p-4 font-semibold text-gray-600 text-xs">Data Summary</th>
                <th className="p-4 font-semibold text-gray-600 text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub, index) => (
                <tr key={sub._id} className="border-b hover:bg-gray-50 align-top">
                  <td className="p-4 text-sm text-gray-400 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-800 block text-sm">{sub.school?.name}</span>
                    <span className="text-xs text-gray-500">{sub.school?.code} • {sub.school?.zone} Zone</span>
                    <div className="mt-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(sub.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {Object.entries(
                        collection.fields.reduce((acc, field) => {
                          if (sub.answers[field.key] !== undefined && sub.answers[field.key] !== '') {
                            const group = field.group || 'General';
                            if (!acc[group]) acc[group] = [];
                            acc[group].push({ label: field.label, value: sub.answers[field.key] });
                          }
                          return acc;
                        }, {})
                      ).map(([groupName, fields]) => {
                        const totalKey = `total_for_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                        const savedTotal = sub.answers[totalKey];

                        return (
                          <div key={groupName} className="bg-gray-50 border border-gray-100 rounded-md p-2">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-bold text-blue-600 uppercase">{groupName}</p>
                              {savedTotal !== undefined && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                                  Total: {savedTotal}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {fields.map(f => (
                                <div key={f.label} className="text-xs">
                                  <span className="text-gray-500">{f.label}:</span> <span className="font-bold">{f.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(sub._id)} 
                      disabled={deletingId === sub._id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === sub._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
