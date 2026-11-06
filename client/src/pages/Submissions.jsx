import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Submissions() {
  const { collectionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      // Fetch collection details to get field labels
      const colRes = await api.get('/collections');
      const currentCol = colRes.data.find(c => c._id === collectionId);
      setCollection(currentCol);

      // Fetch submissions
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!collection) return <div className="p-8">Collection not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Submissions: {collection.name}</h1>
          <p className="text-sm text-gray-500">Term: {collection.term}</p>
        </div>
        <Link to="/collections" className="text-blue-600 hover:underline font-medium text-sm">← Back to Forms</Link>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          No schools have submitted data for this form yet.
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">School</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Source</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Submitted At</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Data Summary</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 align-top">
                    <span className="font-bold text-gray-800 block">{sub.school?.name}</span>
                    <span className="text-xs text-gray-500">{sub.school?.code}</span>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.source === 'office' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {sub.source.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 align-top">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-wrap gap-2 text-sm">
                      {Object.entries(sub.answers).map(([key, val]) => {
                        // Find the label from the collection fields
                        const fieldDef = collection.fields.find(f => f.key === key);
                        const label = fieldDef ? fieldDef.label : key.replace(/_/g, ' ');
                        
                        return (
                          <div key={key} className="bg-gray-100 px-2 py-1 rounded">
                            <span className="text-xs text-gray-500 mr-1">{label}:</span>
                            <span className="font-bold text-gray-800">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-right align-top">
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
