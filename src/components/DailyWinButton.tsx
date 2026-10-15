import { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

const W = 1080;
const H = 1350;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length && ctx.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t + '…';
}

export function renderDailyWinCard(titles: string[], labels: { heading: string; date: string; count: string; more: string; footer: string }) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const css = getComputedStyle(document.documentElement);
  const tok = (n: string, a = 1) => `hsl(${css.getPropertyValue(n).trim()} / ${a})`;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, tok('--primary'));
  bg.addColorStop(1, tok('--secondary'));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // soft glow orbs
  for (const [x, y, r, a] of [[180, 220, 420, 0.25], [900, 1150, 480, 0.2]] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  // glass panel
  roundRect(ctx, 80, 120, W - 160, H - 240, 56);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '600 34px system-ui, sans-serif';
  ctx.fillText(labels.date.toUpperCase(), 150, 220);
  ctx.font = '800 84px system-ui, sans-serif';
  ctx.fillText(labels.heading, 150, 320);
  ctx.font = '500 38px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(labels.count, 150, 385);

  const shown = titles.slice(0, 9);
  let y = 480;
  for (const t of shown) {
    ctx.beginPath(); ctx.arc(172, y - 12, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
    ctx.strokeStyle = tok('--primary'); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(161, y - 12); ctx.lineTo(169, y - 3); ctx.lineTo(184, y - 22); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '500 38px system-ui, sans-serif';
    ctx.fillText(truncate(ctx, t, W - 360), 220, y);
    y += 74;
  }
  if (titles.length > shown.length) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '500 32px system-ui, sans-serif';
    ctx.fillText(labels.more, 220, y);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText(labels.footer, 150, H - 180);
  return c;
}

export function DailyWinButton() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const share = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from('todos')
        .select('title')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('updated_at', start.toISOString())
        .order('updated_at', { ascending: true });
      if (error) throw error;
      const titles = (data ?? []).map((r: any) => r.title as string).filter(Boolean);
      if (!titles.length) {
        toast({ title: t('daily_win_empty'), duration: 2000 });
        return;
      }
      const date = new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
      const canvas = renderDailyWinCard(titles, {
        heading: t('daily_win_heading'),
        date,
        count: t('daily_win_count').replace('{n}', String(titles.length)),
        more: t('daily_win_more').replace('{n}', String(titles.length - 9)),
        footer: 'gradient-todo-vibe.lovable.app',
      });
      const blob: Blob = await new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('blob'))), 'image/png'));
      const file = new File([blob], 'daily-win.png', { type: 'image/png' });
      const nav = navigator as any;
      if (nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: t('daily_win_heading'), text: 'https://gradient-todo-vibe.lovable.app' });
          return;
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'daily-win.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ title: t('daily_win_saved'), duration: 1000 });
    } catch (e: any) {
      toast({ title: t('error'), description: e?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="px-2 h-8 sm:h-9" onClick={share} disabled={busy}
      aria-label={t('daily_win_share')} title={t('daily_win_share')}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
    </Button>
  );
}
