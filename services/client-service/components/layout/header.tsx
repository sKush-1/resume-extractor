'use client';

import { Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { currentUser } from '@/lib/mock-data';

export function Header() {
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
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currentUser.email}
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
              <DropdownMenuItem className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
