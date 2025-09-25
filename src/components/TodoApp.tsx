import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Plus, Check, Archive, Edit2, X, CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDate, setEditingDate] = useState<Date | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить задачи",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title: newTodo.trim(),
            user_id: user.id,
            due_date: newTodoDate ? format(newTodoDate, 'yyyy-MM-dd') : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setTodos([data, ...todos]);
      setNewTodo('');
      setNewTodoDate(undefined);
      toast({
        title: "Успешно!",
        description: "Задача добавлена",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить задачу",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
      toast({
        title: "Успешно!",
        description: "Задача удалена",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      });
    }
  };

  const startEditing = (todo: Todo) => {
    if (todo.completed) return; // Нельзя редактировать выполненные задачи
    setEditingId(todo.id);
    setEditingText(todo.title);
    setEditingDate(todo.due_date ? new Date(todo.due_date) : undefined);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
    setEditingDate(undefined);
  };

  const saveEditing = async () => {
    if (!editingText.trim() || !editingId) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          title: editingText.trim(),
          due_date: editingDate ? format(editingDate, 'yyyy-MM-dd') : null
        })
        .eq('id', editingId);

      if (error) throw error;

      setTodos(todos.map(t =>
        t.id === editingId ? { 
          ...t, 
          title: editingText.trim(),
          due_date: editingDate ? format(editingDate, 'yyyy-MM-dd') : null
        } : t
      ));
      
      setEditingId(null);
      setEditingText('');
      setEditingDate(undefined);
      
      toast({
        title: "Успешно!",
        description: "Задача обновлена",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive",
      });
    }
  };

  const archiveCompletedTodos = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
      toast({
        title: "Информация",
        description: "Нет выполненных задач для архивирования",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('todos')
        .update({ archived: true })
        .in('id', completedTodos.map(todo => todo.id));

      if (error) throw error;

      setTodos(todos.filter(todo => !todo.completed));
      toast({
        title: "Успешно!",
        description: `Архивировано ${completedTodos.length} выполненных задач`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось архивировать задачи",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div>Загрузка задач...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20">
        
        {/* Add Todo Form */}
        <div className="space-y-3 mb-8">
          <div className="flex gap-3">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Добавить новую задачу..."
              className="flex-1 bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
            <Button
              onClick={addTodo}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shrink-0"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-start">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal bg-white/10 border-white/20 text-xs",
                    !newTodoDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-3 h-3 mr-2" />
                  {newTodoDate ? format(newTodoDate, "dd MMM yyyy", { locale: ru }) : "Выбрать дату выполнения"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTodoDate}
                  onSelect={setNewTodoDate}
                  className="pointer-events-auto"
                  initialFocus
                />
                <div className="p-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewTodoDate(undefined)}
                    className="w-full h-7 text-xs"
                  >
                    Убрать дату
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Archive Completed Button */}
        {todos.some(todo => todo.completed) && (
          <div className="mb-6">
            <Button
              onClick={archiveCompletedTodos}
              variant="outline"
              className="w-full bg-white/5 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <Archive className="w-4 h-4 mr-2" />
              Архивировать выполненные задачи ({todos.filter(t => t.completed).length})
            </Button>
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📝</div>
              <p>Пока нет задач</p>
              <p className="text-sm mt-1">Добавьте первую задачу выше</p>
            </div>
          ) : (
            todos
              .sort((a, b) => {
                // Невыполненные задачи сверху (completed: false), выполненные снизу (completed: true)
                if (a.completed === b.completed) {
                  // Если статус одинаковый, сортируем по дате создания (новые сверху)
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                return a.completed ? 1 : -1;
              })
              .map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <Button
                  onClick={() => toggleTodo(todo.id)}
                  variant="ghost"
                  size="icon"
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    todo.completed
                      ? 'bg-gradient-to-r from-primary to-secondary border-transparent text-white'
                      : 'border-muted-foreground/30 hover:border-primary'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3" />}
                </Button>
                
                {editingId === todo.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      className="h-8 bg-white/10 border-white/20 text-foreground"
                      autoFocus
                    />
                    <div className="flex gap-2 items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal bg-white/10 border-white/20 h-8 text-xs",
                              !editingDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {editingDate ? format(editingDate, "dd MMM", { locale: ru }) : "Дата"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editingDate}
                            onSelect={setEditingDate}
                            className="pointer-events-auto"
                            initialFocus
                          />
                          <div className="p-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDate(undefined)}
                              className="w-full h-7 text-xs"
                            >
                              Убрать дату
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        onClick={saveEditing}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span
                        className={`block transition-all duration-200 ${
                          todo.completed
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground'
                        }`}
                        onClick={() => !todo.completed && startEditing(todo)}
                        style={{ cursor: !todo.completed ? 'pointer' : 'default' }}
                      >
                        {todo.title}
                      </span>
                      {todo.due_date && (
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-xs ${
                            new Date(todo.due_date) < new Date() && !todo.completed
                              ? 'text-red-400'
                              : 'text-muted-foreground'
                          }`}>
                            {format(new Date(todo.due_date), "dd MMM yyyy", { locale: ru })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!todo.completed && (
                      <Button
                        onClick={() => startEditing(todo)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
                
                <Button
                  onClick={() => deleteTodo(todo.id)}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Всего задач: {todos.length} | Выполнено: {todos.filter(t => t.completed).length}
          </div>
        )}
      </div>
    </div>
  );
}