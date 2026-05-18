import { useEffect, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/hooks/useLanguage';
import { UserAvatar } from '@/components/UserAvatar';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { Settings, Languages, Star } from 'lucide-react';

const TodoApp = lazy(() => import("@/components/TodoApp"));
export default function Index() {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="text-center">{t('loading')}</div>
        </div>
      </div>;
  }
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <div className="glass-effect rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('welcome')}</h1>
          <p className="mb-6 text-muted-foreground">{t('login_prompt')}</p>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              {t('login_register')}
            </Button>
          </Link>
        </div>
      </div>;
  }
  return <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
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
            <Link to="/archive">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-foreground px-2 h-8 sm:h-9">
                📁
              </Button>
            </Link>
            <UserAvatar avatarUrl={profile?.avatar_url} displayName={profile?.display_name} email={user.email} size="sm" />
            <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
              {profile?.display_name || t('user')}
            </span>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="px-2 h-8 sm:h-9">
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