import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="About Me - Asep Jumadi | Full Stack Developer"
        description="Learn more about Asep Jumadi, a passionate Full Stack Developer with expertise in modern web technologies, clean architecture, and scalable solutions."
        keywords="about, developer bio, software engineer, full stack developer background, tech skills"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('about')}</h1>
        <div className="text-muted-foreground">
          <p>{t('description')}</p>
        </div>
      </div>
    </>
  );
};

export default About;