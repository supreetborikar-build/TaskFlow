import React from 'react';

interface UserAvatarProps {
  name?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name = 'User', className = 'w-8 h-8' }) => {
  const displayName = name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div 
      className={`rounded-full bg-slate-100 dark:bg-slate-800 text-enterprise-textPrimary dark:text-dark-textPrimary font-bold flex items-center justify-center border border-enterprise-border dark:border-dark-border text-[10px] shrink-0 select-none ${className}`} 
      title={name}
    >
      {initials}
    </div>
  );
};
export default UserAvatar;
