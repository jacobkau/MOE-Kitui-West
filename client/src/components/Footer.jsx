export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          
          {/* Left Side - Copyright */}
          <div className="flex justify-center md:justify-start mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Ministry of Education, Kitui West Sub-County. All rights reserved.
            </p>
          </div>

          {/* Right Side - Links / Info */}
          <div className="flex justify-center md:justify-end space-x-6">
            <span className="text-sm text-gray-500">
              Support: <a href="mailto:admin@kituiwest.moe.go.ke" className="text-blue-600 hover:text-blue-800 hover:underline">admin@kituiwest.moe.go.ke</a>
            </span>
            <span className="text-sm text-gray-400 border-l border-gray-300 pl-6">
              System Status: <span className="text-green-600 font-medium">Online</span>
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
