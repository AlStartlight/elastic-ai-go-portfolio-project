import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Footer from '../components/Footer';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-800">
      <header className={`fixed top-0 z-30 w-full transition-all duration-300 ${isScrolling ? "bg-slate-900 shadow-lg" : "bg-zinc-900 backdrop-blur-sm"}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-zinc-900">
          <div className="flex items-center justify-between h-16 bg-zinc-900">
            <Link to="/" className="flex items-center py-4 text-2xl mr-20 font-extrabold text-white">
              Asep Jumadi
            </Link>
            {/* desktop menu button */}
            <div className="hidden md:flex space-x-4 ml-5 gap-4">
              <Link to="/" className="text-white hover:text-gray-900">Home</Link>
              <Link to="/projects" className="text-white hover:text-gray-900">Projects</Link>
              <Link to="/projects" className="text-white hover:text-gray-900">Key Notes</Link>
              <Link to="/about" className="text-white hover:text-gray-900">About</Link>

            </div>
            {/* CTA button */}
            <div className="hidden md:flex ml-auto gap-6 relative z-50">
              <Link to="/admin/login" className="px-4 py-2 rounded hover:bg-yellow-800">
                <span className="flex flex-inline items-center text-gray-200 pointer-events-auto">
                  Get In Touch
                </span>
              </Link>
            </div>
            {/* mobile menu button */}
            <button className="md:hidden max-sm:sticky flex items-center px-3 py-2 rounded-full bg-amber-300 text-gray-500 border-gray-600 hover:text-gray-900 hover:border-gray-900" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {/* mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg">
              <div className="flex flex-col mx-auto items-center p-4">
                <Link to="/" className="text-gray-700 hover:text-gray-900 py-2">Home</Link>
                <Link to="/projects" className="text-gray-700 hover:text-gray-900 py-2">Projects</Link>
                 <Link to="/projects" className="text-gray-700 hover:text-gray-900 py-2">Key Notes</Link>
                <Link to="/about" className="text-gray-700 hover:text-gray-900 py-2">About</Link>
                {/* CTA button */}
                <div className="flex flex-col gap-2 items-center mt-2">
                  <Link to="/admin/login" className="px-4 py-2 rounded hover:bg-blue-600">
                    <span className="flex flex-inline items-center text-gray-700 pointer-events-auto">
                      Get In Touch
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;