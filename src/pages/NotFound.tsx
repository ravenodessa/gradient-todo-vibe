import { SEO } from '@/components/SEO';
import { useLanguage } from '@/hooks/useLanguage';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <SEO
        title={t('notfound_meta_title')}
        description={t('notfound_meta_description')}
        path="/404"
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {t('notfound_title')}
        </h1>
        <p className="mb-4 text-xl text-muted-foreground">{t('notfound_description')}</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/" className="text-primary underline hover:text-primary/80">
            {t('notfound_go_home')}
          </a>
          <a href="/features" className="text-primary underline hover:text-primary/80">
            {t('notfound_features')}
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
