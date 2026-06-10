import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, Edit2, Check, X, ArrowLeft, Star, Copy, Pin, PinOff } from 'lucide-react';
import { format } from 'date-fns';
import { favoriteSchema } from '@/lib/validation';

interface FavoriteTask {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  recurrence_type: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<FavoriteTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorite_tasks')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      toast({ title: t('error'), description: t('failed_load_favorites'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async () => {
    if (!user) return;
    const parsed = favoriteSchema.safeParse({ title: newTitle.trim() });
    if (!parsed.success) {
      toast({ title: t('error'), description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorite_tasks')
        .insert([{ title: newTitle.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setFavorites([data, ...favorites]);
      setNewTitle('');
      toast({ title: t('success'), description: t('favorite_added'), duration: 1000 });
    } catch (error: any) {
      toast({ title: t('error'), description: t('failed_add_favorite'), variant: 'destructive' });
    }
  };

  const updateFavorite = async () => {
    if (!editingTitle.trim() || !editingId) return;

    try {
      const { error } = await supabase
        .from('favorite_tasks')
        .update({ title: editingTitle.trim() })
        .eq('id', editingId);

      if (error) throw error;
      setFavorites(favorites.map(f => f.id === editingId ? { ...f, title: editingTitle.trim() } : f));
      setEditingId(null);
      setEditingTitle('');
      toast({ title: t('success'), description: t('favorite_updated'), duration: 1000 });
    } catch (error: any) {
      toast({ title: t('error'), description: t('failed_update_favorite'), variant: 'destructive' });
    }
  };

  const deleteFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFavorites(favorites.filter(f => f.id !== id));
      toast({ title: t('success'), description: t('favorite_deleted'), duration: 1000 });
    } catch (error: any) {
      toast({ title: t('error'), description: t('failed_delete_favorite'), variant: 'destructive' });
    }
  };

  const togglePin = async (fav: FavoriteTask) => {
    const newPinned = !fav.pinned;
    try {
      const { error } = await supabase
        .from('favorite_tasks')
        .update({ pinned: newPinned })
        .eq('id', fav.id);
      if (error) throw error;
      setFavorites(prev => {
        const updated = prev.map(f => f.id === fav.id ? { ...f, pinned: newPinned } : f);
        return [...updated].sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });
      toast({ title: t('success'), description: newPinned ? t('favorite_pinned') : t('favorite_unpinned'), duration: 1000 });
    } catch (error: any) {
      toast({ title: t('error'), description: t('failed_update_favorite'), variant: 'destructive' });
    }
  };

  const addToTodos = async (favorite: FavoriteTask) => {
    if (!user) return;

    try {
      // Get the maximum order_index from today's todos to put new task at the bottom
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: todayTodos } = await supabase
        .from('todos')
        .select('order_index')
        .eq('user_id', user.id)
        .eq('archived', false)
        .eq('due_date', today);

      const maxOrderIndex = todayTodos && todayTodos.length > 0
        ? Math.max(...todayTodos.map((t: any) => t.order_index || 0))
        : 0;

      const { error } = await supabase
        .from('todos')
        .insert([{
          title: favorite.title,
          user_id: user.id,
          due_date: today,
          notes: favorite.notes,
          recurrence_type: favorite.recurrence_type,
          order_index: maxOrderIndex + 1,
        }]);

      if (error) throw error;

      // Move this favorite to the bottom of the favorites list
      // Favorites are ordered by created_at desc, so oldest is at the bottom.
      const oldestCreatedAt = favorites.length > 0
        ? Math.min(...favorites.map(f => new Date(f.created_at).getTime()))
        : Date.now();
      const newCreatedAt = new Date(oldestCreatedAt - 1000).toISOString();

      const { error: updateError } = await supabase
        .from('favorite_tasks')
        .update({ created_at: newCreatedAt })
        .eq('id', favorite.id);

      if (updateError) throw updateError;

      // Reorder local state: move this favorite to the end
      setFavorites(prev => {
        const updated = prev.map(f =>
          f.id === favorite.id ? { ...f, created_at: newCreatedAt } : f
        );
        const moved = updated.find(f => f.id === favorite.id)!;
        const rest = updated.filter(f => f.id !== favorite.id);
        return [...rest, moved];
      });

      toast({ title: t('success'), description: t('favorite_added_to_tasks'), duration: 1000 });
    } catch (error: any) {
      toast({ title: t('error'), description: t('failed_add_task'), variant: 'destructive' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addFavorite();
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') updateFavorite();
    if (e.key === 'Escape') { setEditingId(null); setEditingTitle(''); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="text-center">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/">
              <Button variant="outline" size="sm" className="px-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('favorites')}
            </h1>
          </div>

          {/* Add Form */}
          <div className="flex gap-3 mb-6">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('add_favorite_placeholder')}
              className="flex-1 bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
            <Button
              onClick={addFavorite}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shrink-0"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* List */}
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">⭐</div>
              <p>{t('no_favorites')}</p>
              <p className="text-sm mt-1">{t('no_favorites_description')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${fav.pinned ? 'bg-primary/10 border-primary/30 hover:bg-primary/15' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  {editingId === fav.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleEditKeyPress}
                        className="h-8 bg-white/10 border-white/20 text-foreground"
                        autoFocus
                      />
                      <Button onClick={updateFavorite} variant="ghost" size="icon" className="w-8 h-8 text-green-400 hover:text-green-300">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => { setEditingId(null); setEditingTitle(''); }} variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                      <span
                        className="flex-1 text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => { setEditingId(fav.id); setEditingTitle(fav.title); }}
                      >
                        {fav.title}
                      </span>
                      <Button
                        onClick={() => togglePin(fav)}
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 ${fav.pinned ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-foreground'} hover:bg-white/10`}
                        title={fav.pinned ? t('unpin') : t('pin_to_top')}
                      >
                        {fav.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => addToTodos(fav)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                        title={t('add_to_tasks')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => { setEditingId(fav.id); setEditingTitle(fav.title); }}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteFavorite(fav.id)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {favorites.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t('total_favorites')}: {favorites.length}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
