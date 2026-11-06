import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-500 mt-2">Welcome back. Manage your schools and data collections below.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/schools" className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Schools Registry</h3>
          <p className="text-gray-500 leading-relaxed">View, import via Excel/CSV, and manage the 123 registered schools across the 4 zones.</p>
        </Link>
        
        <Link to="/collections" className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-green-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-xl"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Data Collections</h3>
          <p className="text-gray-500 leading-relaxed">Create dynamic forms, generate public links for schools, and export submitted data to Excel.</p>
        </Link>
      </div>
    </div>
  );
}
