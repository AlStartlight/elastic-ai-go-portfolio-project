import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('dashboard')}</h1>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/admin/homepage" 
            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">Manage Homepage</h3>
              <p className="text-sm text-blue-100">Edit hero & tech stacks</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            to="/admin/projects" 
            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">Manage Projects</h3>
              <p className="text-sm text-purple-100">Add, edit, or delete projects</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            to="/admin/articles" 
            className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">My Key Notes</h3>
              <p className="text-sm text-green-100">Manage featured articles</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            to="/admin/about" 
            className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">About Me</h3>
              <p className="text-sm text-indigo-100">Update your bio & info</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            to="/admin/newsletter" 
            className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">Newsletter</h3>
              <p className="text-sm text-pink-100">View subscribers</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            to="/admin/courses" 
            className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">Online Courses</h3>
              <p className="text-sm text-orange-100">Manage courses & lessons</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            to="/admin/change-password" 
            className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold">Change Password</h3>
              <p className="text-sm text-orange-100">Update your security</p>
            </div>
            <svg className="w-8 h-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Projects</h2>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Active</h2>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Draft</h2>
            <p className="text-2xl font-bold text-yellow-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;