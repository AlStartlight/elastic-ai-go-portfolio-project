import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, BookOpen, ChevronDown } from 'lucide-react';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isCustomer = isAuthenticated && user?.user_type === 'customer';
  const isOnCoursesPage = location.pathname.startsWith('/courses');

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

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
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center py-4 text-2xl mr-8 font-extrabold text-white">
              Asep Jumadi
            </Link>
            
            {/* Navigation for Customer (Udemy-style) */}
            {isCustomer ? (
              <>
                {/* My Learning Link */}
                <div className="hidden md:flex items-center gap-6">
                  <Link 
                    to="/courses" 
                    className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                  >
                    <BookOpen size={20} />
                    <span className="font-medium">My Learning</span>
                  </Link>
                </div>
                
                {/* User Menu */}
                <div className="hidden md:flex ml-auto items-center gap-4 relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{user?.name}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                      <Link
                        to="/courses"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <BookOpen size={16} />
                        My Learning
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Regular Navigation for Guests */}
                <div className="hidden md:flex space-x-4 ml-5 gap-4">
                  <Link to="/" className="text-white hover:text-gray-300">Home</Link>
                  <Link to="/projects" className="text-white hover:text-gray-300">Projects</Link>
                  <Link to="/projects" className="text-white hover:text-gray-300">Key Notes</Link>
                  <Link to="/about" className="text-white hover:text-gray-300">About</Link>
                </div>
                {/* CTA buttons for guests */}
                <div className="hidden md:flex ml-auto gap-3 relative z-50">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded text-gray-200 hover:bg-zinc-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
            {/* mobile menu button */}
            <button className="md:hidden max-sm:sticky flex items-center px-3 py-2 rounded-full bg-amber-300 text-gray-500 border-gray-600 hover:text-gray-900 hover:border-gray-900" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          {/* mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg">
              <div className="flex flex-col mx-auto items-center p-4">
                {isCustomer ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 w-full text-center">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <Link 
                      to="/courses" 
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 py-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BookOpen size={18} />
                      My Learning
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <Link to="/projects" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
                    <Link to="/projects" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>Key Notes</Link>
                    <Link to="/about" className="text-gray-700 hover:text-gray-900 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                    <div className="flex gap-2 mt-4">
                      <Link 
                        to="/login" 
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/register" 
                        className="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
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