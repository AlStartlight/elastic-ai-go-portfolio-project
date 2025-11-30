import React from 'react';
import { useTranslation } from 'react-i18next';

const Projects: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('projects')}</h1>
      <div className="text-center text-muted-foreground">
        <p>{t('no_projects')}</p>
      </div>
    </div>
  );
};

export default Projects;