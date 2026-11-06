import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Submissions() {
  const { collectionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      // 1. Fetch collection details to get field labels and groups
      const colRes = await api.get('/collections');
      const currentCol = colRes.data.find(c => c._id === collectionId);
      setCollection(currentCol);

      // 2. Fetch submissions
      const subRes = await api.get(`/submissions/collection/${collectionId}`);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [collectionId]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
      setDeletingId(id);
      try {
        await api.delete(`/submissions/${id}`);
        fetchData(); // Refresh list
      } catch (err) {
        alert("Failed to delete submission.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading submissions...</div>;
  if (!collection) return <div className="p-8 text-center text-red-500">Collection not found.</div>;

  // Filter by search
  const filteredSubmissions = submissions.filter(sub => 
    sub.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.school?.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Submissions: {collection.name}</h1>
          <p className="text-sm text-gray-500">Term: {collection.term} • Total Received: {submissions.length}</p>
        </div>
        <Link to="/collections" className="text-blue-600 hover:underline font-medium text-sm">← Back to Forms</Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search by school name or code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
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
                <th className="p-4 font-semibold text-gray-600 text-xs">Submitted At</th>
                <th className="p-4 font-semibold text-gray-600 text-xs">Data Summary</th>
                <th className="p-4 font-semibold text-gray-600 text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub, index) => (
                <tr key={sub._id} className="border-b hover:bg-gray-50 align-top">
                  {/* Numbering */}
                  <td className="p-4 text-sm text-gray-400 text-center font-medium">
                    {index + 1}
                  </td>

                  {/* School Info */}
                  <td className="p-4">
                    <span className="font-bold text-gray-800 block text-sm">{sub.school?.name}</span>
                    <span className="text-xs text-gray-500">{sub.school?.code} • {sub.school?.zone} Zone</span>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.source === 'office' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {sub.source === 'office' ? 'OFFICE ENTRY' : 'SCHOOL LINK'}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-xs text-gray-600">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>

                  {/* Grouped Data Summary */}
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {Object.entries(
                        // Group the answers by their group name
                        collection.fields.reduce((acc, field) => {
                          if (sub.answers[field.key] !== undefined && sub.answers[field.key] !== '') {
                            const group = field.group || 'General';
                            if (!acc[group]) acc[group] = [];
                            acc[group].push({ label: field.label, value: sub.answers[field.key] });
                          }
                          return acc;
                        }, {})
                      ).map(([groupName, fields]) => (
                        <div key={groupName} className="bg-gray-50 border border-gray-100 rounded-md p-2">
                          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{groupName}</p>
                          <div className="flex flex-wrap gap-3">
                            {fields.map(f => (
                              <div key={f.label} className="text-xs">
                                <span className="text-gray-500">{f.label}:</span> <span className="font-bold text-gray-800">{f.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
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
