import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/UserAvatar';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { Settings, Languages, Star } from 'lucide-react';
import { SEO } from '@/components/SEO';

const TodoApp = lazy(() => import("@/components/TodoApp"));
export default function Index() {
  const {
    user,
    loading,
    signOut,
    signInWithGoogle
  } = useAuth();
  const {
    profile
  } = useProfile();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const guestSeo = <SEO
    title={t('guest_meta_title')}
    description={t('guest_meta_description')}
    path="/"
  />;
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        {guestSeo}
        <div className="glass-effect rounded-lg p-8">
          <div className="text-center">{t('loading')}</div>
        </div>
      </div>;
  }
  if (!user) {
    return <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        {guestSeo}
        <div className="glass-effect rounded-2xl p-8 max-w-xl w-full text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('welcome_title')}
          </h1>
          <p className="mb-4 text-muted-foreground">
            {t('welcome_description')}
          </p>
          <ul className="mb-6 text-sm text-muted-foreground space-y-2 text-left mx-auto max-w-md">
            <li>• {t('welcome_bullet_recurring')}</li>
            <li>• {t('welcome_bullet_favorites')}</li>
            <li>• {t('welcome_bullet_archive')}</li>
            <li>• {t('welcome_bullet_pwa')}</li>
          </ul>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={async () => {
                const { error } = await signInWithGoogle();
                if (error) {
                  toast({ title: t('error'), description: error.message, variant: 'destructive' });
                }
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t('continue_with_google')}
            </Button>
            <Link to="/auth">
              <Button variant="outline">
                {t('login_register')}
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline">{t('all_features')}</Button>
            </Link>
          </div>
        </div>
      </main>;
  }
  return <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <SEO title={t('app_meta_title')} description={t('app_meta_description')} path="/" />
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-t-2xl px-4 sm:px-8 pt-6 pb-4 shadow-2xl border border-white/20 border-b-0">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('your_tasks')}
            </h1>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
            <PWAInstallButton />
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 h-8 sm:h-9"
              onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            >
              <Languages className="h-4 w-4" />
            </Button>
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 px-2 h-8 sm:h-9" title={t('favorites')}>
                <Star className="h-4 w-4 fill-yellow-400" />
              </Button>
            </Link>
            <Link to="/sync-history">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-foreground px-2 h-8 sm:h-9" aria-label={t('sync_history')} title={t('sync_history')}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/archive">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-foreground px-2 h-8 sm:h-9" aria-label={t('open_archive')} title={t('open_archive')}>
                📁
              </Button>
            </Link>
            <UserAvatar avatarUrl={profile?.avatar_url} displayName={profile?.display_name} email={user.email} size="sm" />
            <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
              {profile?.display_name || t('user')}
            </span>
            <Link to="/profile">
              <Button variant="outline" size="sm" aria-label={t('open_settings')} title={t('open_settings')} className="px-2 h-8 sm:h-9">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut} className="px-2 h-8 sm:h-9">
              <span className="hidden sm:inline">{t('logout')}</span>
              <span className="sm:hidden">✕</span>
            </Button>
          </div>
        </div>
        </div>
        <Suspense fallback={
          <div className="glass-effect rounded-b-2xl p-8 shadow-2xl border border-white/20 border-t-0 text-center">
            <div className="animate-pulse">{t('loading_tasks')}</div>
          </div>
        }>
          <TodoApp />
        </Suspense>
      </div>
    </main>;
}