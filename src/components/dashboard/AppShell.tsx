import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Brain,
  CalendarRange,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { BrandLock } from "@/components/brand/KixtoBrand";
import { markAllNotificationsRead, useAllowedModules, useDashboard, type ModuleKey } from "@/lib/dashboard";
import { formatDistanceToNow } from "date-fns";

const NAV: { key: ModuleKey; label: string; to: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { key: "practice-papers", label: "Practice Papers", to: "/practice-papers", icon: FileText },
  { key: "memory-guard", label: "Memory Guard", to: "/memory-guard", icon: Brain },
  { key: "planner", label: "Planner", to: "/planner", icon: CalendarRange },
  { key: "analytics", label: "Analytics", to: "/analytics", icon: BarChart3 },
  { key: "downloads", label: "Downloads", to: "/downloads", icon: Download },
  { key: "settings", label: "Settings", to: "/settings", icon: Settings },
];

function AppSidebar({ allowed }: { allowed: ModuleKey[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV.filter((n) => allowed.includes(n.key));

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarContent className="bg-card">
        <div className="flex h-16 items-center px-4">
          <Link to="/dashboard" aria-label="Kixto home">
            <BrandLock className="group-data-[collapsible=icon]:hidden" />
            <img
              src="/kixtologo.png"
              alt=""
              className="hidden h-8 w-8 object-contain group-data-[collapsible=icon]:block"
            />
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = pathname === item.to;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="h-11 rounded-2xl">
                      <Link to={item.to} className="flex items-center gap-3 font-medium">
                        <item.icon className="h-[18px] w-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useDashboard();
  const allowed = useAllowedModules(data);
  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.read_at).length;
  const name = data?.profile?.full_name?.trim() || "there";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar allowed={allowed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="shrink-0" />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
                {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search" className="h-10 w-48 rounded-full pl-9 lg:w-64" aria-label="Search" />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" aria-hidden />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 rounded-3xl p-0">
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unread > 0 && data?.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={async () => {
                          await markAllNotificationsRead(data.userId);
                          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-80">
                    {notifications.length === 0 ? (
                      <p className="px-4 pb-5 text-sm text-muted-foreground">
                        No notifications yet. Reminders will appear here.
                      </p>
                    ) : (
                      <ul className="pb-2">
                        {notifications.map((n) => (
                          <li key={n.id} className="border-t border-border/60 px-4 py-3">
                            <p className="text-sm font-medium">{n.title}</p>
                            {n.body ? <p className="text-xs text-muted-foreground">{n.body}</p> : null}
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 rounded-full pl-1 pr-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full brand-gradient-bg text-xs font-bold text-primary-foreground">
                      {initials || "K"}
                    </span>
                    <span className="hidden max-w-24 truncate text-sm font-medium sm:block">{name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="truncate">{data?.profile?.email ?? "Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile & settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}