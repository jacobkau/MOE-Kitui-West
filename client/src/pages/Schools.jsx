import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schools')
      .then(res => setSchools(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Registered Schools</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

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
          {schools.length === 0 && <p className="p-8 text-center text-gray-500">No schools found. Did you run the seed script?</p>}
        </div>
      )}
    </div>
  );
}
