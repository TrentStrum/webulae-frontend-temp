import { ReactNode } from 'react';

export interface SidebarProps {
  open?: boolean;
  children: ReactNode;
  className?: string;
}

export interface SidebarBodyProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarLinkProps {
  link: {
    href: string;
    icon: ReactNode;
    label: string;
  };
} 