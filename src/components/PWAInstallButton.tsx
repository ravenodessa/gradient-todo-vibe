import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useLanguage } from '@/hooks/useLanguage';

export function PWAInstallButton() {
  const { isInstallable, installPWA } = usePWAInstall();
  const { t } = useLanguage();

  if (!isInstallable) return null;

  return (
    <Button
      onClick={installPWA}
      variant="outline"
      size="sm"
      className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:from-primary/20 hover:to-secondary/20"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">{t('install_app')}</span>
    </Button>
  );
}
