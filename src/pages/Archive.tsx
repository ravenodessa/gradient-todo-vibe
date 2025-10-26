import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trash2, Check, CalendarIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

interface ArchivedTodo {
  id: string;
  title: string;
  completed: boolean;
  archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function Archive() {
  const [archivedTodos, setArchivedTodos] = useState<ArchivedTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const dateLocale = language === 'ru' ? ru : enUS;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchArchivedTodos();
  }, [user, navigate]);

  const fetchArchivedTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('archived', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setArchivedTodos(data || []);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_load_archived'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ archived: false })
        .eq('id', id);

      if (error) throw error;

      setArchivedTodos(archivedTodos.filter(todo => todo.id !== id));
      toast({
        title: t('success'),
        description: t('task_restored'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_restore_task'),
        variant: "destructive",
      });
    }
  };

  const deleteTodoPermanently = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArchivedTodos(archivedTodos.filter(todo => todo.id !== id));
      toast({
        title: t('success'),
        description: t('task_deleted'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_delete_task'),
        variant: "destructive",
      });
    }
  };

  const deleteAllArchivedTodos = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('archived', true);

      if (error) throw error;

      setArchivedTodos([]);
      toast({
        title: t('success'),
        description: t('all_archived_deleted'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_delete_all'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div>{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('task_archive')}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20">
            
            {archivedTodos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">📁</div>
                <p>{t('archive_empty')}</p>
                <p className="text-sm mt-1">{t('archive_description')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    {t('total_in_archive')}: {archivedTodos.length} {archivedTodos.length === 1 ? t('task') : t('tasks')}
                  </div>
                  
                  {archivedTodos.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {t('delete_all')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('delete_all_archived')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('delete_all_warning')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteAllArchivedTodos}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('delete_all')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                {archivedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        todo.completed
                          ? 'bg-gradient-to-r from-primary to-secondary border-transparent text-white'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {todo.completed && <Check className="w-4 h-4" />}
                    </Button>

                    <div className="flex-1">
                      <span className={`block transition-all duration-200 ${
                        todo.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}>
                        {todo.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {t('archived_on')}: {format(new Date(todo.updated_at), "dd MMM yyyy", { locale: dateLocale })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => restoreTodo(todo.id)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title={t('restore')}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => deleteTodoPermanently(todo.id)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title={t('delete_forever')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
