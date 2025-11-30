import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">Page not found</p>
      <a href="/" className="btn-primary px-6 py-3">
        {t('home')}
      </a>
    </div>
  );
};

export default NotFound;