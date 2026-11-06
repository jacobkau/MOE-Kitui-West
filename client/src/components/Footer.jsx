export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Top Row: Copyright & Support */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex justify-center md:justify-start mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Ministry of Education, Kitui West Sub-County. All rights reserved.
            </p>
          </div>

          <div className="flex justify-center md:justify-end space-x-6">
            <span className="text-sm text-gray-500">
              Support: <a href="mailto:scdekituiwest@gmail.com" className="text-blue-600 hover:text-blue-800 hover:underline">scdekituiwest@gmail.com</a>
            </span>
            <span className="text-sm text-gray-400 border-l border-gray-300 pl-6">
              System Status: <span className="text-green-600 font-medium">Online</span>
            </span>
          </div>
        </div>

        {/* Bottom Row: Developer Credit */}
        <div className="border-t border-gray-100 pt-6 flex justify-center md:justify-between items-center flex-col md:flex-row gap-2">
          <p className="text-xs text-gray-400">
            Built for the Ministry of Education.
          </p>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
            Developed by 
            <a 
              href="https://jacob-mwambwa-portfolio.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
            >
              Jacob Mwambwa
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
