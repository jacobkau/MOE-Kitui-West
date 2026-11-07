import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Schools', path: '/schools' },
    { name: 'Zonal Directory', path: '/directory' },
    { name: 'Collections', path: '/collections' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 md:gap-4 hover:opacity-90 transition-opacity">
            {/* Custom MOE-style Shield Logo (SVG) */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 100 120" 
              className="w-10 md:w-12 h-auto drop-shadow-sm flex-shrink-0"
            >
              <path d="M 50 5 L 90 20 L 90 60 C 90 90 50 115 50 115 C 50 115 10 90 10 60 L 10 20 Z" fill="white" stroke="#1e3a8a" strokeWidth="4" />
              <path d="M 50 12 L 84 25 L 84 60 C 84 85 50 107 50 107 C 50 107 16 85 16 60 L 16 25 Z" fill="#f8fafc" />
              <path d="M 50 12 L 84 25 L 84 40 C 84 40 50 50 50 50 C 50 50 16 40 16 40 L 16 25 Z" fill="#000000" />
              <path d="M 50 50 C 50 50 84 40 84 40 L 84 60 C 84 70 50 80 50 80 C 50 80 16 70 16 60 L 16 40 C 16 40 50 50 50 50 Z" fill="#dc2626" />
              <path d="M 50 80 C 50 80 84 70 84 60 L 84 60 C 84 85 50 107 50 107 C 50 107 16 85 16 60 L 16 60 C 16 70 50 80 50 80 Z" fill="#16a34a" />
              <path d="M 35 45 C 35 45 45 40 50 45 C 55 40 65 45 65 45 L 65 75 C 65 75 55 70 50 75 C 45 70 35 75 35 75 Z" fill="white" stroke="#1e3a8a" strokeWidth="2" />
              <circle cx="50" cy="25" r="4" fill="#facc15" />
            </svg>

            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Ministry of Education</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium tracking-wide">KITUI WEST SUB-COUNTY</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Desktop Logout Button */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              Logout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                // Close Icon (X)
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                // Hamburger Icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile Logout Button */}
            <div className="pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-md text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}