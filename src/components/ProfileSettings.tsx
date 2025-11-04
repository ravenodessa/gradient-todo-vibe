import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from './UserAvatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Camera, Save } from 'lucide-react';
import { profileSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    
    // Validate input before updating
    const validationResult = profileSchema.safeParse({
      display_name: displayName.trim() || null,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: t('error'),
        description: firstError.message,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    await updateProfile({ display_name: validationResult.data.display_name });
    setSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile_settings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
              email={user?.email}
              size="lg"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          {uploading && (
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            value={user?.email || ''}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">{t('display_name')}</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('display_name_placeholder')}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? t('saving') : t('save')}
        </Button>
      </CardContent>
    </Card>
  );
};