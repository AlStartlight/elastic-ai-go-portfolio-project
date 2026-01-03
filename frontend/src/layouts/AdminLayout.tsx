import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Layers, 
  FolderOpen, 
  FileText, 
  BookOpen,
  Users, 
  Mail, 
  Info,
  Lock,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Home, label: 'Homepage', path: '/admin/homepage' },
    { icon: Layers, label: 'Tech Stacks', path: '/admin/tech-stacks' },
    { icon: FolderOpen, label: 'Projects', path: '/admin/projects' },
    { icon: FileText, label: 'Articles', path: '/admin/articles' },
    { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
    { icon: Info, label: 'About', path: '/admin/about' },
    { icon: Mail, label: 'Newsletter', path: '/admin/newsletter' },
    { icon: Lock, label: 'Change Password', path: '/admin/change-password' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } fixed h-screen z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {sidebarOpen && <h2 className="text-xl font-bold">Admin Panel</h2>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-red-400 mt-4 border-t border-gray-800"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Super Admin Dashboard</h1>
          </div>
        </header>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
