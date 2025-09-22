import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();

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
        title: "Ошибка",
        description: "Не удалось загрузить архивированные задачи",
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
        title: "Успешно!",
        description: "Задача восстановлена",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось восстановить задачу",
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
        title: "Успешно!",
        description: "Задача удалена навсегда",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div>Загрузка архива...</div>
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
            Архив задач
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20">
            
            {archivedTodos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">📁</div>
                <p>Архив пуст</p>
                <p className="text-sm mt-1">Архивированные задачи будут отображаться здесь</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  Всего в архиве: {archivedTodos.length} {archivedTodos.length === 1 ? 'задача' : 'задач'}
                </div>
                
                {archivedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <span className={`transition-all duration-200 ${
                        todo.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}>
                        {todo.title}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        Архивировано: {new Date(todo.updated_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => restoreTodo(todo.id)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Восстановить задачу"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => deleteTodoPermanently(todo.id)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Удалить навсегда"
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