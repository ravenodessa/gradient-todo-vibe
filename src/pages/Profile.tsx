import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

const ProfileSettings = lazy(() => import('@/components/ProfileSettings').then(module => ({ default: module.ProfileSettings })));

export default function Profile() {
  const { t } = useLanguage();
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <SEO title="Профиль — Todo List" description="Настройки профиля: имя, аватар и язык интерфейса." path="/profile" />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('profile')}
          </h1>
        </div>
        
        <Suspense fallback={
          <Card>
            <CardContent className="p-6">
              <div className="text-center animate-pulse">{t('loading')}</div>
            </CardContent>
          </Card>
        }>
          <ProfileSettings />
        </Suspense>
      </div>
    </main>
  );
}