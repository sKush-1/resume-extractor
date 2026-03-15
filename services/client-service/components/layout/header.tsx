'use client';

import { Bell, Menu, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetchApi('/user/logout', { method: 'POST' });
      router.push('/auth/login');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) return null;

  return (
    <header className="lg:ml-64 border-b border-border bg-background sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Mobile menu */}
        <div className="flex items-center gap-4 lg:hidden">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="ml-auto flex items-center gap-4">
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-muted px-3 py-2 rounded-lg transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
