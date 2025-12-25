import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Admin Panel</div>
            <div className="flex gap-4">
              <a href="/admin/dashboard" className="hover:text-primary">Dashboard</a>
              <a href="/admin/projects" className="hover:text-primary">Projects</a>
              <a href="/admin/change-password" className="hover:text-primary">Ganti Password</a>
              <button onClick={handleLogout} className="btn-outline px-4 py-2">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;