import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch everything in parallel to save time
        const [schoolRes, dashStatsRes] = await Promise.all([
          api.get('/schools/stats/dashboard'),
          api.get('/collections/stats/dashboard')
        ]);

        setStats(schoolRes.data);
        setCollectionsCount(dashStatsRes.data.collectionsCount);
        setSubmissionsCount(dashStatsRes.data.submissionsCount);

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-500 mt-1 text-sm">Overview of schools, data collections, and submissions in Kitui West Sub-County.</p>
      </div>

      {/* TOP STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/schools" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow block group">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Registered Schools</p>
          <p className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{stats?.totalSchools || 0}</p>
          <span className="text-xs text-blue-600 mt-2 inline-block">View All Registry →</span>
        </Link>
        
        <Link to="/collections" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500 hover:shadow-md transition-shadow block group">
          <p className="text-sm text-gray-500 font-medium mb-1">Data Collections</p>
          <p className="text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">{collectionsCount}</p>
          <span className="text-xs text-green-600 mt-2 inline-block">Manage Forms →</span>
        </Link>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Submissions</p>
          <p className="text-3xl font-bold text-gray-800">{submissionsCount}</p>
          <span className="text-xs text-gray-400 mt-2 inline-block">Across all forms</span>
        </div>

        <Link to="/directory" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-orange-400 hover:shadow-md transition-shadow block group">
          <p className="text-sm text-gray-500 font-medium mb-1">Active Zones</p>
          <p className="text-3xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors">4</p>
          <span className="text-xs text-orange-500 mt-2 inline-block">View Directory →</span>
        </Link>
      </div>

      {/* CATEGORIES BREAKDOWN */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">School Categories Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Public Primary Link */}
        <Link to="/schools?tab=primary" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-blue-400 hover:shadow-md transition-all group">
          <div>
            <p className="text-sm text-gray-500 group-hover:text-blue-600">Public Primary</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.public_primary || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-100">P</div>
        </Link>
        
        {/* Private Primary Link */}
        <Link to="/schools?tab=private" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-green-400 hover:shadow-md transition-all group">
          <div>
            <p className="text-sm text-gray-500 group-hover:text-green-600">Private Primary</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.private_primary || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-lg group-hover:bg-green-100">Pv</div>
        </Link>

        {/* Secondary Link */}
        <Link to="/schools?tab=secondary" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-purple-400 hover:shadow-md transition-all group">
          <div>
            <p className="text-sm text-gray-500 group-hover:text-purple-600">Secondary Schools</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.secondary || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg group-hover:bg-purple-100">S</div>
        </Link>

        {/* Special Link */}
        <Link to="/schools?tab=special" className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-orange-400 hover:shadow-md transition-all group">
          <div>
            <p className="text-sm text-gray-500 group-hover:text-orange-500">Special Schools</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.special || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-lg group-hover:bg-orange-100">Sp</div>
        </Link>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/collections" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div>
            <h3 className="text-md font-bold text-gray-800 group-hover:text-green-600 transition-colors">Create a New Data Collection</h3>
            <p className="text-xs text-gray-500">Build a dynamic form and generate a link for schools.</p>
          </div>
        </Link>

        <Link to="/schools" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <div>
            <h3 className="text-md font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Import or Manage Schools</h3>
            <p className="text-xs text-gray-500">Upload Excel sheets, edit HOI details, or manage zones.</p>
          </div>
        </Link>
      </div>

    </div>
  );
}