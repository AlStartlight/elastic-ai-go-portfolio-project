import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Projects: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="Projects - Asep Jumadi | Portfolio & Case Studies"
        description="Explore my portfolio of web development projects featuring React, TypeScript, Go, and modern tech stack. Real-world applications and case studies."
        keywords="portfolio, web development projects, react projects, golang projects, case studies, web applications"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('projects')}</h1>
        <div className="text-center text-muted-foreground">
          <p>{t('no_projects')}</p>
        </div>
      </div>
    </>
  );
};

export default Projects;