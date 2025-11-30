import React from 'react';
import { useTranslation } from 'react-i18next';

const ManageProjects: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('manage_projects')}</h1>
        <button className="btn-primary px-4 py-2">{t('create')} Project</button>
      </div>
      <div className="card p-6">
        <div className="text-center text-muted-foreground">
          <p>{t('no_projects')}</p>
        </div>
      </div>
    </div>
  );
};

export default ManageProjects;