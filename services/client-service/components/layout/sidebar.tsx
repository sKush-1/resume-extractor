'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Zap,
  BarChart3,
  Download,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload Batch', href: '/dashboard/upload', icon: Upload },
  { label: 'Processing Jobs', href: '/dashboard/jobs', icon: Zap },
  { label: 'Results', href: '/dashboard/results', icon: BarChart3 },
  { label: 'Exports', href: '/dashboard/exports', icon: Download },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
          RP
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-sidebar-foreground">
            ResumeParse
          </span>
          <span className="text-xs text-sidebar-foreground/60">Beta</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent text-sm font-medium transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
