import React from "react";
import { cn } from "@/lib/utils";
import { SidebarProps, SidebarBodyProps, SidebarLinkProps } from "../../types";

export function Sidebar({ open, children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300",
        open ? "" : "w-20",
        className
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarBody({ children, className }: SidebarBodyProps) {
  return (
    <div className={cn("flex flex-col flex-1 p-4", className)}>{children}</div>
  );
}

export function SidebarLink({ link }: SidebarLinkProps) {
  return (
    <a
      href={link.href}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-800 dark:text-neutral-200"
    >
      {link.icon}
      <span>{link.label}</span>
    </a>
  );
} 