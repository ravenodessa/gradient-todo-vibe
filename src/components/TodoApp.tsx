import { useState, useEffect, useRef, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Check, Archive, Edit2, X, CalendarIcon, Repeat, GripVertical, Bell, BellOff, Keyboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useNotifications } from '@/hooks/useNotifications';
import { format, addWeeks, startOfWeek, Locale } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { todoSchema } from '@/lib/validation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  notes: string | null;
  recurrence_type: 'daily' | 'weekdays' | 'weekends' | null;
  order_index: number;
  reminder_time: string | null;
}

interface SortableItemProps {
  todo: Todo;
  editingId: string | null;
  editingText: string;
  editingNotes: string;
  editingDate: Date | undefined;
  editingRecurrence: string;
  editingReminderTime: string;
  dateLocale: Locale;
  isSupported: boolean;
  permission: NotificationPermission;
  t: (key: string) => string;
  setEditingText: (text: string) => void;
  setEditingNotes: (notes: string) => void;
  setEditingDate: (date: Date | undefined) => void;
  setEditingRecurrence: (recurrence: string) => void;
  setEditingReminderTime: (time: string) => void;
  toggleTodo: (id: string) => void;
  startEditing: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  saveEditing: () => void;
  cancelEditing: () => void;
  handleEditKeyPress: (e: React.KeyboardEvent) => void;
  renderNotesWithLinks: (notes: string) => React.ReactNode;
  requestPermission: () => void;
  index: number;
  showBadge: boolean;
}

const SortableItem = memo(({ 
  todo, 
  editingId,
  editingText,
  editingNotes,
  editingDate,
  editingRecurrence,
  editingReminderTime,
  dateLocale,
  isSupported,
  permission,
  t,
  setEditingText,
  setEditingNotes,
  setEditingDate,
  setEditingRecurrence,
  setEditingReminderTime,
  toggleTodo,
  startEditing,
  deleteTodo,
  saveEditing,
  cancelEditing,
  handleEditKeyPress,
  renderNotesWithLinks,
  requestPermission,
  index,
  showBadge,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {showBadge && (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold shrink-0">
          {index + 1}
        </div>
      )}
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
        <div className="relative">
          <Input
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            placeholder="Заметки (макс. 200 символов)"
            className="h-8 bg-white/10 border-white/20 text-foreground text-xs pr-12"
          />
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
            editingNotes.length > 200 ? 'text-red-400' : 'text-muted-foreground'
          }`}>
            {editingNotes.length}/200
          </span>
        </div>
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
              <Select value={editingRecurrence} onValueChange={setEditingRecurrence}>
                <SelectTrigger className="bg-white/10 border-white/20 h-8 text-xs w-auto">
                  <Repeat className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('recurrence_none')}</SelectItem>
                  <SelectItem value="daily">{t('recurrence_daily')}</SelectItem>
                  <SelectItem value="weekdays">{t('recurrence_weekdays')}</SelectItem>
                  <SelectItem value="weekends">{t('recurrence_weekends')}</SelectItem>
                </SelectContent>
              </Select>
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
              <Button
                onClick={() => {
                  const nextMonday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });
                  setEditingDate(nextMonday);
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-xs hover:bg-white/20 h-8 w-full sm:w-auto"
              >
                {t('next_week')}
              </Button>
            </div>
            {isSupported && (
              <div className="flex gap-2 items-center">
                <Input
                  type="time"
                  value={editingReminderTime}
                  onChange={(e) => setEditingReminderTime(e.target.value)}
                  className="bg-white/10 border-white/20 text-foreground h-8 text-xs w-32"
                  placeholder="HH:MM"
                />
                {editingReminderTime && (
                  <Button
                    onClick={() => setEditingReminderTime('')}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <BellOff className="w-3 h-3 mr-1" />
                    {t('remove_reminder')}
                  </Button>
                )}
                {permission !== 'granted' && (
                  <Button
                    onClick={requestPermission}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white/10 border-white/20"
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    {t('enable_notifications')}
                  </Button>
                )}
              </div>
            )}
            <div className="flex gap-2 items-center">
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
          {todo.notes && (
            <div className="mt-1 text-xs text-muted-foreground break-words break-all">
              {renderNotesWithLinks(todo.notes)}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {todo.due_date && (
              <div className="flex items-center gap-1">
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
            {todo.recurrence_type && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                <Repeat className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary">
                  {todo.recurrence_type === 'daily' && t('recurrence_daily')}
                  {todo.recurrence_type === 'weekdays' && t('recurrence_weekdays')}
                  {todo.recurrence_type === 'weekends' && t('recurrence_weekends')}
                 </span>
               </div>
             )}
             {todo.reminder_time && (
               <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                 <Bell className="w-3 h-3 text-accent-foreground" />
                 <span className="text-xs text-accent-foreground">
                   {format(new Date(todo.reminder_time), "HH:mm", { locale: dateLocale })}
                 </span>
               </div>
             )}
           </div>
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
});

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState<Date | undefined>(new Date());
  const [newTodoRecurrence, setNewTodoRecurrence] = useState<string>('none');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDate, setEditingDate] = useState<Date | undefined>();
  const [editingNotes, setEditingNotes] = useState('');
  const [editingRecurrence, setEditingRecurrence] = useState<string>('none');
  const [editingReminderTime, setEditingReminderTime] = useState<string>('');
  const [newTodoReminderTime, setNewTodoReminderTime] = useState<string>('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isOnline, queueOperation } = useOfflineSync();
  const { 
    permission, 
    requestPermission, 
    scheduleNotification, 
    cancelNotification,
    isSupported 
  } = useNotifications();

  const dateLocale = language === 'ru' ? ru : enUS;

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  useEffect(() => {
    // Schedule notifications for all tasks with reminder_time
    todos.forEach(todo => {
      if (todo.reminder_time && !todo.completed && permission === 'granted') {
        const reminderDate = new Date(todo.reminder_time);
        if (reminderDate > new Date()) {
          scheduleNotification(
            todo.id,
            todo.title,
            reminderDate,
            t('reminder_time')
          );
        }
      }
    });
  }, [todos, permission, scheduleNotification, t]);

  // Focus input on mount and after loading
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // Ctrl+N: Focus on new task input (only if not typing)
      if (e.ctrlKey && e.key === 'n' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      // Ctrl+E: Start editing first incomplete task (only if not typing)
      if (e.ctrlKey && e.key === 'e' && !isInputFocused) {
        e.preventDefault();
        if (editingId) {
          // If already editing, save
          saveEditing();
        } else {
          // Find first incomplete task
          const firstIncompleteTodo = todos.find(t => !t.completed);
          if (firstIncompleteTodo) {
            startEditing(firstIncompleteTodo);
          }
        }
        return;
      }

      // Escape: Cancel editing
      if (e.key === 'Escape' && editingId) {
        e.preventDefault();
        cancelEditing();
        return;
      }

      // Ctrl+S: Save editing
      if (e.ctrlKey && e.key === 's' && editingId) {
        e.preventDefault();
        saveEditing();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId, todos]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('archived', false)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos((data || []) as Todo[]);
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
      // Validate input before sending to database
      const validationResult = todoSchema.safeParse({
        title: newTodo.trim(),
        notes: null,
        due_date: format(newTodoDate || new Date(), 'yyyy-MM-dd'),
        recurrence_type: newTodoRecurrence === 'none' ? null : newTodoRecurrence,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: t('error'),
          description: firstError.message,
          variant: 'destructive',
        });
        return;
      }

      const maxOrderIndex = todos.length > 0 
        ? Math.max(...todos.map(t => t.order_index || 0))
        : 0;

      const reminderDateTime = newTodoReminderTime 
        ? `${format(newTodoDate || new Date(), 'yyyy-MM-dd')}T${newTodoReminderTime}:00`
        : null;

      const newTodoData = {
        title: validationResult.data.title,
        user_id: user.id,
        due_date: validationResult.data.due_date,
        recurrence_type: validationResult.data.recurrence_type,
        order_index: maxOrderIndex + 1,
        reminder_time: reminderDateTime,
      };

      if (isOnline) {
        const { data, error } = await supabase
          .from('todos')
          .insert([newTodoData])
          .select()
          .single();

        if (error) throw error;
        
        setTodos([...todos, data as Todo]);
      } else {
        // Offline: create temporary todo with local ID
        const tempTodo = {
          ...newTodoData,
          id: `temp-${Date.now()}`,
          completed: false,
          archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: null,
        } as Todo;
        
        setTodos([...todos, tempTodo]);
        queueOperation({
          id: tempTodo.id,
          type: 'insert',
          table: 'todos',
          data: newTodoData,
        });
      }

      setNewTodo('');
      setNewTodoDate(new Date());
      setNewTodoRecurrence('none');
      setNewTodoReminderTime('');
      
      // Focus input after adding task
      setTimeout(() => inputRef.current?.focus(), 0);
      
      toast({
        title: t('success'),
        description: isOnline ? t('task_added') : t('offline_mode'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('failed_add_task'),
        variant: "destructive",
      });
    }
  };

  const getNextRecurrenceDate = (currentDate: string, recurrenceType: string): string => {
    const date = new Date(currentDate);
    
    if (recurrenceType === 'daily') {
      date.setDate(date.getDate() + 1);
      return format(date, 'yyyy-MM-dd');
    }
    
    if (recurrenceType === 'weekdays') {
      // Найти следующий рабочий день
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() === 0 || date.getDay() === 6);
      return format(date, 'yyyy-MM-dd');
    }
    
    if (recurrenceType === 'weekends') {
      // Найти следующий выходной день
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() !== 0 && date.getDay() !== 6);
      return format(date, 'yyyy-MM-dd');
    }
    
    return currentDate;
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo || !user) return;

    try {
      // Если задача повторяющаяся и её завершают
      if (todo.recurrence_type && !todo.completed) {
        // Создаем новую задачу с следующей датой
        const nextDate = getNextRecurrenceDate(todo.due_date || format(new Date(), 'yyyy-MM-dd'), todo.recurrence_type);
        
        const { data: newTodo, error: createError } = await supabase
          .from('todos')
          .insert([{
            title: todo.title,
            user_id: user.id,
            due_date: nextDate,
            recurrence_type: todo.recurrence_type,
            notes: todo.notes,
          }])
          .select()
          .single();

        if (createError) throw createError;

        // Помечаем текущую задачу как выполненную
        const { error: updateError } = await supabase
          .from('todos')
          .update({ completed: true })
          .eq('id', id);

        if (updateError) throw updateError;

        setTodos([newTodo as Todo, ...todos.map(t =>
          t.id === id ? { ...t, completed: true } : t
        )]);

        toast({
          title: t('success'),
          description: 'Создана следующая повторяющаяся задача',
        });
      } else {
        // Обычное переключение статуса
        if (isOnline) {
          const { error } = await supabase
            .from('todos')
            .update({ completed: !todo.completed })
            .eq('id', id);

          if (error) throw error;
        } else {
          queueOperation({
            id,
            type: 'update',
            table: 'todos',
            data: { completed: !todo.completed },
          });
        }

        setTodos(todos.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ));
      }
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
      if (isOnline) {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        queueOperation({
          id,
          type: 'delete',
          table: 'todos',
        });
      }

      cancelNotification(id);
      setTodos(todos.filter(todo => todo.id !== id));
      toast({
        title: t('success'),
        description: isOnline ? t('task_deleted') : t('offline_mode'),
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
    setEditingNotes(todo.notes || '');
    setEditingRecurrence(todo.recurrence_type || 'none');
    setEditingReminderTime(todo.reminder_time ? new Date(todo.reminder_time).toTimeString().slice(0, 5) : '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
    setEditingDate(undefined);
    setEditingNotes('');
    setEditingRecurrence('none');
    setEditingReminderTime('');
  };

  const saveEditing = async () => {
    if (!editingText.trim() || !editingId) return;

    try {
      // Validate input before sending to database
      const validationResult = todoSchema.safeParse({
        title: editingText.trim(),
        notes: editingNotes.trim() || null,
        due_date: editingDate ? format(editingDate, 'yyyy-MM-dd') : null,
        recurrence_type: editingRecurrence === 'none' ? null : editingRecurrence,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: t('error'),
          description: firstError.message,
          variant: 'destructive',
        });
        return;
      }

      const reminderDateTime = editingReminderTime && editingDate
        ? `${format(editingDate, 'yyyy-MM-dd')}T${editingReminderTime}:00`
        : null;

      const updateData = { 
        title: validationResult.data.title,
        due_date: validationResult.data.due_date,
        notes: validationResult.data.notes,
        recurrence_type: validationResult.data.recurrence_type,
        reminder_time: reminderDateTime,
      };

      if (isOnline) {
        const { error } = await supabase
          .from('todos')
          .update(updateData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        queueOperation({
          id: editingId,
          type: 'update',
          table: 'todos',
          data: updateData,
        });
      }

      setTodos(todos.map(t =>
        t.id === editingId ? { 
          ...t, 
          title: validationResult.data.title,
          due_date: validationResult.data.due_date,
          notes: validationResult.data.notes,
          recurrence_type: validationResult.data.recurrence_type as any,
          reminder_time: reminderDateTime,
        } : t
      ));
      
      setEditingId(null);
      setEditingText('');
      setEditingDate(undefined);
      setEditingNotes('');
      setEditingRecurrence('none');
      setEditingReminderTime('');
      
      toast({
        title: t('success'),
        description: isOnline ? t('task_updated') : t('offline_mode'),
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
    overdue: todos.filter(todo => {
      if (!todo.due_date || todo.completed) return false;
      return todo.due_date < todayStr;
    }),
    today: todos.filter(todo => todo.due_date === todayStr),
    tomorrow: todos.filter(todo => todo.due_date === tomorrowStr),
    later: todos.filter(todo => {
      if (!todo.due_date) return true;
      return todo.due_date > tomorrowStr;
    })
  };

  const handleDragEnd = async (event: DragEndEvent, sectionTodos: Todo[]) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sectionTodos.findIndex((todo) => todo.id === active.id);
    const newIndex = sectionTodos.findIndex((todo) => todo.id === over.id);

    const reorderedTodos = arrayMove(sectionTodos, oldIndex, newIndex);
    
    // Update order_index for all items in this section
    const updatedTodos = reorderedTodos.map((todo, index) => ({
      ...todo,
      order_index: index,
    }));

    // Optimistically update UI
    setTodos(prevTodos => {
      const otherTodos = prevTodos.filter(t => !sectionTodos.find(st => st.id === t.id));
      return [...otherTodos, ...updatedTodos];
    });

    // Save to database
    try {
      const updates = updatedTodos.map((todo) =>
        supabase
          .from('todos')
          .update({ order_index: todo.order_index })
          .eq('id', todo.id)
      );

      await Promise.all(updates);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: 'Не удалось сохранить порядок задач',
        variant: "destructive",
      });
      // Revert on error
      fetchTodos();
    }
  };

  const renderNotesWithLinks = (notes: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = notes.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };


  const renderTodoSection = (title: string, sectionTodos: Todo[], emoji: string, showBadge: boolean = false) => {
    if (sectionTodos.length === 0) return null;

    const sortedTodos = sectionTodos.sort((a, b) => {
      if (a.completed === b.completed) {
        return (a.order_index || 0) - (b.order_index || 0);
      }
      return a.completed ? 1 : -1;
    });

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{emoji}</span>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">({sectionTodos.length})</span>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, sortedTodos)}
        >
          <SortableContext
            items={sortedTodos.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sortedTodos.map((todo, index) => (
                <SortableItem 
                  key={todo.id} 
                  todo={todo}
                  editingId={editingId}
                  editingText={editingText}
                  editingNotes={editingNotes}
                  editingDate={editingDate}
                  editingRecurrence={editingRecurrence}
                  editingReminderTime={editingReminderTime}
                  dateLocale={dateLocale}
                  isSupported={isSupported}
                  permission={permission}
                  t={t}
                  setEditingText={setEditingText}
                  setEditingNotes={setEditingNotes}
                  setEditingDate={setEditingDate}
                  setEditingRecurrence={setEditingRecurrence}
                  setEditingReminderTime={setEditingReminderTime}
                  toggleTodo={toggleTodo}
                  startEditing={startEditing}
                  deleteTodo={deleteTodo}
                  saveEditing={saveEditing}
                  cancelEditing={cancelEditing}
                  handleEditKeyPress={handleEditKeyPress}
                  renderNotesWithLinks={renderNotesWithLinks}
                  requestPermission={requestPermission}
                  index={index}
                  showBadge={showBadge}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-effect rounded-b-2xl p-8 shadow-2xl border border-white/20 border-t-0">
        
        {/* Keyboard Shortcuts Button */}
        <div className="flex justify-end mb-4">
          <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                {t('keyboard_shortcuts')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('keyboard_shortcuts')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">{t('shortcuts_description')}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{t('shortcut_new_task')}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">Ctrl+N</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{t('shortcut_edit_task')}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">Ctrl+E</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{t('shortcut_save')}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">Ctrl+S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{t('shortcut_cancel')}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">Esc</kbd>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Add Todo Form */}
        <div className="space-y-3 mb-8">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
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
            <Select value={newTodoRecurrence} onValueChange={setNewTodoRecurrence}>
              <SelectTrigger className="bg-white/10 border-white/20 h-auto text-xs w-auto py-2">
                <Repeat className="w-3 h-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('recurrence_none')}</SelectItem>
                <SelectItem value="daily">{t('recurrence_daily')}</SelectItem>
                <SelectItem value="weekdays">{t('recurrence_weekdays')}</SelectItem>
                <SelectItem value="weekends">{t('recurrence_weekends')}</SelectItem>
              </SelectContent>
            </Select>
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
          {isSupported && (
            <div className="flex gap-2 items-center flex-wrap">
              <Input
                type="time"
                value={newTodoReminderTime}
                onChange={(e) => setNewTodoReminderTime(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground h-9 text-xs w-32"
                placeholder="HH:MM"
              />
              {newTodoReminderTime && (
                <Button
                  onClick={() => setNewTodoReminderTime('')}
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs"
                >
                  <BellOff className="w-3 h-3 mr-1" />
                  {t('remove_reminder')}
                </Button>
              )}
              {permission !== 'granted' && (
                <Button
                  onClick={requestPermission}
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs bg-white/10 border-white/20"
                >
                  <Bell className="w-3 h-3 mr-1" />
                  {t('enable_notifications')}
                </Button>
              )}
            </div>
          )}
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
            {renderTodoSection(t('overdue'), groupedTodos.overdue, "⚠️", false)}
            {renderTodoSection(t('today'), groupedTodos.today, "📅", true)}
            {renderTodoSection(t('tomorrow'), groupedTodos.tomorrow, "⏰", true)}
            {renderTodoSection(t('later'), groupedTodos.later, "📆", true)}
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
