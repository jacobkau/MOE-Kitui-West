import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Submissions() {
  const { collectionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/submissions/collection/${collectionId}`)
      .then(res => setSubmissions(res.data))
      .finally(() => setLoading(false));
  }, [collectionId]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Submissions</h1>
        <Link to="/collections" className="text-blue-600 hover:underline">← Back to Forms</Link>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No schools have submitted data for this form yet.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">School</th>
                <th className="p-4 font-semibold text-gray-600">Source</th>
                <th className="p-4 font-semibold text-gray-600">Submitted At</th>
                <th className="p-4 font-semibold text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-bold">{sub.school?.name}</span><br/>
                    <span className="text-xs text-gray-500">{sub.school?.code}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.source === 'office' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {sub.source.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{new Date(sub.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex gap-4 text-sm bg-gray-100 p-2 rounded">
                      {Object.entries(sub.answers).map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase">{key.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-gray-800">{val}</span>
                        </div>
                      ))}
                    </div>
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
