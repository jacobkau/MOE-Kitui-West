import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Submissions() {
  const { collectionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const colRes = await api.get('/collections');
      const currentCol = colRes.data.find(c => c._id === collectionId);
      setCollection(currentCol);
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
    if (window.confirm("Delete this submission?")) {
      setDeletingId(id);
      try {
        await api.delete(`/submissions/${id}`);
        fetchData();
      } catch (err) {
        alert("Failed to delete.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!collection) return <div className="p-8">Collection not found.</div>;

  const filteredSubmissions = submissions.filter(sub => 
    sub.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.school?.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Submissions: {collection.name}</h1>
          <p className="text-sm text-gray-500">Total: {submissions.length}</p>
        </div>
        <Link to="/collections" className="text-blue-600 hover:underline">← Back</Link>
      </div>

      <input 
        type="text" 
        placeholder="Search school..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full max-w-sm px-4 py-2 border rounded-lg text-sm"
      />

      <div className="bg-white shadow-sm rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs w-12 text-center">#</th>
              <th className="p-4 text-xs">School</th>
              <th className="p-4 text-xs">Data Summary</th>
              <th className="p-4 text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub, index) => (
              <tr key={sub._id} className="border-b align-top hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-400 text-center">{index + 1}</td>
                <td className="p-4">
                  <span className="font-bold text-sm block">{sub.school?.name}</span>
                  <span className="text-xs text-gray-500">{sub.school?.code}</span>
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
                      // Check if we saved a total for this group
                      const totalKey = `total_for_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                      const savedTotal = sub.answers[totalKey];

                      return (
                        <div key={groupName} className="bg-gray-50 border rounded-md p-2">
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
                  <button onClick={() => handleDelete(sub._id)} className="text-red-500 text-sm font-medium">
                    {deletingId === sub._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
