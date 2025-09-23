import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar = ({ 
  avatarUrl, 
  displayName, 
  email, 
  size = 'md',
  className 
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage src={avatarUrl || undefined} alt={displayName || email || 'User'} />
      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};