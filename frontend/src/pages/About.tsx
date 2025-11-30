import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('about')}</h1>
      <div className="text-muted-foreground">
        <p>{t('description')}</p>
      </div>
    </div>
  );
};

export default About;