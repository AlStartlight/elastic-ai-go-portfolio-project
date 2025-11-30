import React from 'react';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('dashboard')}</h1>
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
  );
};

export default Dashboard;