import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Schools', path: '/schools' },
    { name: 'Collections', path: '/collections' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            {/* Custom MOE-style Crest (SVG) */}
            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center shadow-inner text-white font-serif font-bold text-xl tracking-tighter">
              MOE
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">MOE Kitui West</h1>
              <p className="text-sm text-gray-500 font-medium tracking-wide">SUB-COUNTY DATA PORTAL</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold transition-colors px-3 py-2 rounded-md ${
                  location.pathname === link.path
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              Logout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
