'use client';

import { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';

interface UserNavProps {
  user: User;
  signOut: () => void;
}

export function UserNav({ user, signOut }: UserNavProps) {
  const { state } = useSidebar();
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').substring(0,2).toUpperCase();
  };

  const isSidebarExpanded = state !== 'collapsed';

  if (!isSidebarExpanded) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{user.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" className="h-7 w-7">
            <LogOut className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
           <DropdownMenuItem onClick={signOut}>
             <LogOut className="mr-2 h-4 w-4" />
             <span>Log out</span>
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
    </div>
  );
}
