import React from 'react';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">{t('login')}</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('email')}</label>
            <input type="email" className="input w-full" placeholder={t('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('password')}</label>
            <input type="password" className="input w-full" placeholder={t('password')} />
          </div>
          <button type="submit" className="btn-primary w-full py-2">
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;