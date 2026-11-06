import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ZonalDirectory() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Central'); 
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/schools')
      .then(res => setSchools(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Dynamically get unique zones from the database
  const zones = [...new Set(schools.map(s => s.zone))].sort();

  // Filter schools by active tab and search
  const filteredSchools = schools.filter(s => 
    s.zone === activeTab && 
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center">Loading directory...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Zonal Directory</h1>
          <p className="text-gray-500 mt-1">View schools categorized by their respective zones.</p>
        </div>
        <Link to="/schools" className="text-blue-600 hover:underline font-medium">← Back to Registry</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto bg-gray-50">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => { setActiveTab(zone); setSearch(''); }}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === zone 
                  ? 'border-blue-600 text-blue-700 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {zone} Zone 
              <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {schools.filter(s => s.zone === zone).length}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-800">{activeTab} Zone Schools</h2>
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-64 text-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Code</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">School Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map(school => (
                <tr key={school._id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-700">{school.code}</td>
                  <td className="p-4 text-sm text-gray-900 font-bold">{school.name}</td>
                  <td className="p-4 text-sm">
                    <span className="capitalize px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {school.category.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">No schools found in this zone.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
