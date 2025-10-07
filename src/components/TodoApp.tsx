import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Plus, Check, Archive, Edit2, X, CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { format, addWeeks, startOfWeek } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
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
  const { t, language } = useLanguage();

  const dateLocale = language === 'ru' ? ru : enUS;

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
        title: t('error'),
        description: t('failed_load_tasks'),
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
            due_date: format(newTodoDate || new Date(), 'yyyy-MM-dd'),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      setTodos([data, ...todos]);
      setNewTodo('');
      setNewTodoDate(undefined);
      toast({
        title: t('success'),
        description: t('task_added'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_add_task'),
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
        title: t('error'),
        description: t('failed_update_task'),
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

  const startEditing = (todo: Todo) => {
    if (todo.completed) return;
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
        title: t('success'),
        description: t('task_updated'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_update_task'),
        variant: "destructive",
      });
    }
  };

  const archiveCompletedTodos = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
      toast({
        title: t('info'),
        description: t('no_completed_tasks'),
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
        title: t('success'),
        description: t('tasks_archived').replace('{count}', completedTodos.length.toString()),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_archive_tasks'),
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
          <div>{t('loading_tasks')}</div>
        </div>
      </div>
    );
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

  const groupedTodos = {
    today: todos.filter(todo => todo.due_date === todayStr),
    tomorrow: todos.filter(todo => todo.due_date === tomorrowStr),
    later: todos.filter(todo => {
      if (!todo.due_date) return true;
      return todo.due_date > tomorrowStr;
    })
  };

  const renderTodoItem = (todo: Todo) => (
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
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center flex-wrap">
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
                      {editingDate ? format(editingDate, "EEE dd MMM", { locale: dateLocale }) : t('date')}
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
                        {t('remove_date')}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setEditingDate(tomorrow);
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-xs hover:bg-white/20 h-8"
                >
                  {t('tomorrow')}
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => {
                    const nextMonday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
                    setEditingDate(nextMonday);
                  }}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-xs hover:bg-white/20 h-8 flex-1 sm:flex-initial"
                >
                  {t('next_week')}
                </Button>
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
                  {format(new Date(todo.due_date), "EEE dd MMM yyyy", { locale: dateLocale })}
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
  );

  const renderTodoSection = (title: string, todos: Todo[], emoji: string) => {
    if (todos.length === 0) return null;

    const sortedTodos = todos.sort((a, b) => {
      if (a.completed === b.completed) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.completed ? 1 : -1;
    });

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{emoji}</span>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">({todos.length})</span>
        </div>
        <div className="space-y-3">
          {sortedTodos.map(renderTodoItem)}
        </div>
      </div>
    );
  };

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
              placeholder={t('add_new_task')}
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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-start flex-wrap">
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
                    {newTodoDate ? format(newTodoDate, "EEE dd MMM yyyy", { locale: dateLocale }) : t('select_date')}
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
                      {t('remove_date')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setNewTodoDate(tomorrow);
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-xs hover:bg-white/20"
              >
                {t('tomorrow')}
              </Button>
            </div>
            <Button
              onClick={() => {
                const nextMonday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
                setNewTodoDate(nextMonday);
              }}
              variant="outline"
              className="bg-white/10 border-white/20 text-xs hover:bg-white/20 w-full sm:w-auto"
            >
              {t('next_week')}
            </Button>
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
              {t('archive_completed')} ({todos.filter(t => t.completed).length})
            </Button>
          </div>
        )}

        {/* Todo Sections */}
        {todos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📝</div>
            <p>{t('no_tasks')}</p>
            <p className="text-sm mt-1">{t('no_tasks_description')}</p>
          </div>
        ) : (
          <>
            {renderTodoSection(t('today'), groupedTodos.today, "📅")}
            {renderTodoSection(t('tomorrow'), groupedTodos.tomorrow, "⏰")}
            {renderTodoSection(t('later'), groupedTodos.later, "📆")}
          </>
        )}

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('active_tasks')}: {todos.filter(t => !t.completed).length} | {t('total_tasks')}: {todos.length}
          </div>
        )}
      </div>
    </div>
  );
}
