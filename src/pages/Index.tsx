import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { UserAvatar } from '@/components/UserAvatar';
import TodoApp from "@/components/TodoApp";
import { Settings } from 'lucide-react';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="text-center">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <div className="glass-effect rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Добро пожаловать в TodoApp</h1>
          <p className="mb-6 text-muted-foreground">Войдите, чтобы управлять своими задачами</p>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              Войти / Регистрация
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ваши задачи
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link to="/archive" className="order-3 sm:order-1">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-foreground">
                📁
                <span className="hidden sm:inline ml-1">Архив</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 order-1 sm:order-2 flex-1 sm:flex-none">
              <UserAvatar
                avatarUrl={profile?.avatar_url}
                displayName={profile?.display_name}
                email={user.email}
                size="sm"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {profile?.display_name || 'Пользователь'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <div className="flex gap-2 order-2 sm:order-3">
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                <span className="hidden sm:inline">Выйти</span>
                <span className="sm:hidden">✕</span>
              </Button>
            </div>
          </div>
        </div>
        <TodoApp />
      </div>
    </div>
  );
}