'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  MessageSquare,
  FolderOpen,
  Settings,
  CreditCard,
  BarChart3,
  Menu,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

interface DashboardShellProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const sidebarItems = [
    {
      label: 'New Chat',
      icon: Plus,
      href: '/chat',
      variant: 'default' as const,
    },
    {
      label: 'Conversations',
      icon: MessageSquare,
      href: '/conversations',
    },
    {
      label: 'Projects',
      icon: FolderOpen,
      href: '/projects',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      submenu: [
        { label: 'Usage', href: '/settings/usage', icon: BarChart3 },
        { label: 'Billing', href: '/settings/billing', icon: CreditCard },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Branding */}
      <div className="px-4 py-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">APEX-CODE</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <a
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>

              {/* Submenu */}
              {item.submenu && active && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.submenu.map((subitem) => {
                    const SubIcon = subitem.icon;
                    const subActive = pathname === subitem.href;

                    return (
                      <a
                        key={subitem.href}
                        href={subitem.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          subActive
                            ? 'bg-blue-700 text-white'
                            : 'text-gray-400 hover:bg-gray-800'
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span>{subitem.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-60 border-r border-gray-800">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-gray-800 bg-gray-900 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Branding for Mobile */}
            <div className="md:hidden">
              <h1 className="text-lg font-bold text-white">APEX-CODE</h1>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm text-gray-300">
                  {user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
