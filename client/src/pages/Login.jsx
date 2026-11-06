import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"><polygon points="0,100 100,0 100,100" fill="currentColor"/></svg>
        </div>
        
        <div className="relative z-10 text-center max-w-md">
          {/* Custom MOE-style Shield Logo (SVG) */}
          <div className="w-32 h-32 mx-auto mb-8 drop-shadow-2xl">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 100 120" 
              className="w-full h-full"
            >
              {/* Shield Outline */}
              <path d="M 50 5 L 90 20 L 90 60 C 90 90 50 115 50 115 C 50 115 10 90 10 60 L 10 20 Z" fill="white" stroke="#1e3a8a" strokeWidth="4" />
              
              {/* Inner Shield */}
              <path d="M 50 12 L 84 25 L 84 60 C 84 85 50 107 50 107 C 50 107 16 85 16 60 L 16 25 Z" fill="#f8fafc" />
              
              {/* Kenyan Flag Colors (Black, Red, Green) */}
              <path d="M 50 12 L 84 25 L 84 40 C 84 40 50 50 50 50 C 50 50 16 40 16 40 L 16 25 Z" fill="#000000" />
              <path d="M 50 50 C 50 50 84 40 84 40 L 84 60 C 84 70 50 80 50 80 C 50 80 16 70 16 60 L 16 40 C 16 40 50 50 50 50 Z" fill="#dc2626" />
              <path d="M 50 80 C 50 80 84 70 84 60 L 84 60 C 84 85 50 107 50 107 C 50 107 16 85 16 60 L 16 60 C 16 70 50 80 50 80 Z" fill="#16a34a" />
              
              {/* Book / Knowledge Symbol */}
              <path d="M 35 45 C 35 45 45 40 50 45 C 55 40 65 45 65 45 L 65 75 C 65 75 55 70 50 75 C 45 70 35 75 35 75 Z" fill="white" stroke="#1e3a8a" strokeWidth="2" />
              
              {/* Star at top */}
              <circle cx="50" cy="25" r="4" fill="#facc15" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Kitui West Sub-County</h1>
          <p className="text-blue-200 text-lg">Ministry of Education Data Collection & Management Portal</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
            <p className="text-gray-500">Enter your credentials to access the portal.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 border border-red-100">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
