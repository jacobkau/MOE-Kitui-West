import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ZonalDirectory() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(''); 
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/schools')
      .then(res => {
        setSchools(res.data);
        // Automatically set the first zone as the active tab
        const uniqueZones = [...new Set(res.data.map(s => s.zone))].sort();
        if (uniqueZones.length > 0) {
          setActiveTab(uniqueZones[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Dynamically get unique zones from the database
  const zones = [...new Set(schools.map(s => s.zone))].sort();

  // Filter schools by active tab and search
  const filteredSchools = schools.filter(s => 
    s.zone === activeTab && 
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
     s.code.toLowerCase().includes(search.toLowerCase()) ||
     (s.upnCode && s.upnCode.toLowerCase().includes(search.toLowerCase())) ||
     (s.principalName && s.principalName.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading directory...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zonal Directory</h1>
          <p className="text-sm text-gray-500 mt-1">View schools and contact details categorized by their respective zones.</p>
        </div>
        <Link to="/schools" className="text-blue-600 hover:underline font-medium text-sm">← Back to Registry</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto bg-gray-50">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => { setActiveTab(zone); setSearch(''); }}
              className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
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
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-3">
          <h2 className="text-lg font-bold text-gray-800">{activeTab} Zone Schools</h2>
          <input 
            type="text" 
            placeholder="Search by name, code, UPN, or Principal..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-80 text-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
          <table className="w-full text-left relative">
            <thead className="bg-gray-100 border-b sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 font-semibold text-gray-600 text-xs w-12 text-center">#</th>
                <th className="p-3 font-semibold text-gray-600 text-xs">Code / UPN</th>
                <th className="p-3 font-semibold text-gray-600 text-xs">School Name & Location</th>
                <th className="p-3 font-semibold text-gray-600 text-xs">Category</th>
                <th className="p-3 font-semibold text-gray-600 text-xs">Principal / HOI Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school, index) => (
                <tr key={school._id} className="border-b hover:bg-blue-50 transition-colors">
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
                    {school.principalName ? (
                      <div>
                        <div className="font-semibold text-gray-700">{school.principalName}</div>
                        {school.principalPhone && (
                          <a href={`tel:${school.principalPhone}`} className="text-blue-600 hover:underline text-xs">
                            📞 {school.principalPhone}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No contact info</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No schools found in this zone.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
