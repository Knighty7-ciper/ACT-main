'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  Users,
  Wallet,
  ArrowLeftRight,
  Settings,
  BarChart3,
  Coins,
  TrendingUp,
  Shield,
  Bell,
  Menu,
  LogOut,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admino77', icon: Home, current: false },
  { name: 'User Management', href: '/admino77/users', icon: Users, current: false },
  { name: 'Transactions', href: '/admino77/transactions', icon: ArrowLeftRight, current: false },
  { name: 'Wallets', href: '/admino77/wallets', icon: Wallet, current: false },
  { name: 'Exchange Rates', href: '/admino77/exchange-rates', icon: TrendingUp, current: false },
  { name: 'PPP Management', href: '/admino77/ppp', icon: Coins, current: false },
  { name: 'Analytics', href: '/admino77/analytics', icon: BarChart3, current: false },
  { name: 'KYC Queue', href: '/admino77/kyc', icon: Shield, current: false },
  { name: 'News Management', href: '/admino77/news', icon: Bell, current: false },
  { name: 'Settings', href: '/admino77/settings', icon: Settings, current: false },
];

interface AdminNavBarProps {
  user?: {
    email: string;
    name?: string;
  };
}

export function AdminNavBar({ user }: AdminNavBarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PA</span>
              </div>
              <span className="font-bold text-xl text-foreground">PESA-AFRIK</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Admin
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex items-center gap-2 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'admin@pesa-afrik.com'}</p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Admin Navigation</SheetTitle>
                  <SheetDescription>
                    Navigate through admin sections
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin' && pathname.startsWith(item.href));
                    
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={`w-full justify-start gap-3 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}