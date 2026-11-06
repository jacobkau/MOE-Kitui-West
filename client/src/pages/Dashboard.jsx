import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MOE Kitui West Sub-County</h1>
        <button onClick={handleLogout} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 text-sm">Logout</button>
      </nav>

      <main className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/schools" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Schools Registry</h3>
            <p className="text-gray-600">View, import, and manage the 123 registered schools.</p>
          </Link>
          
          {/* Placeholders for what we build next */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 opacity-60">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Data Collections</h3>
            <p className="text-gray-600">Create forms, view submissions, and export Excel/PDF (Coming next).</p>
          </div>
        </div>
      </main>
    </div>
  );
}
