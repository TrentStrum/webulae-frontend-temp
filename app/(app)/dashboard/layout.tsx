import type { ReactNode } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FolderKanban, 
  BarChart2, 
  FileText, 
  Shield, 
  ChevronLeft, 
  Settings 
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardLayout({ children }: { children: ReactNode }): React.ReactElement {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
    },
    {
      label: "Chat",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />
    },
    {
      label: "Projects",
      href: "/projects",
      icon: <FolderKanban className="h-5 w-5 text-muted-foreground" />
    },
    {
      label: "Metrics",
      href: "/metrics",
      icon: <BarChart2 className="h-5 w-5 text-muted-foreground" />
    },
    {
      label: "Documents",
      href: "/documents",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />
    },
    {
      label: "Policy Bot",
      href: "/policy-bot",
      icon: <Shield className="h-5 w-5 text-muted-foreground" />
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar className="border-r border-border/40">
        <SidebarBody className="flex flex-col h-full justify-between p-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 p-4 border-b border-border/40">
              <div className="bg-primary/10 p-2 rounded-md">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Webulae</span>
            </div>
            
            <ScrollArea className="flex-1 py-2">
              <div className="space-y-1 px-2">
                {links.map((link, idx) => (
                  <SidebarLink 
                    key={idx} 
                    link={{
                      ...link,
                      icon: link.icon
                    }} 
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="mt-auto border-t border-border/40 p-4">
            <SidebarLink
              link={{
                label: "Settings",
                href: "/settings",
                icon: <Settings className="h-5 w-5 text-muted-foreground" />
              }}
            />
            <SidebarLink
              link={{
                label: "Back",
                href: "/",
                icon: <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              }}
            />
            <div className="mt-4 flex items-center gap-3 px-2 py-3">
              <Avatar>
                <AvatarImage src="https://assets.aceternity.com/manu.png" alt="Avatar" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">User Profile</span>
                <span className="text-xs text-muted-foreground">user@example.com</span>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}