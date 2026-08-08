import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Bug,
  CalendarRange,
  CreditCard,
  Database,
  Download,
  FileText,
  FlaskConical,
  Gauge,
  HardDrive,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Mail,
  Moon,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  Terminal,
  Users,
  Wallet,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { ModuleBoundary } from "@/components/system/ErrorBoundary";
import { notify } from "@/lib/system/notify";
import { useSuperAdminGate } from "@/lib/admin/superadmin";
import { useCommandCenter } from "@/lib/admin/queries";

type NavItem = { label: string; to: string; icon: typeof Users };

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ label: "Command Center", to: "/admin", icon: LayoutDashboard }] },
  {
    group: "People",
    items: [
      { label: "Students", to: "/admin/users", icon: Users },
      { label: "Admins", to: "/admin/admins", icon: ShieldCheck },
      { label: "Roles & Permissions", to: "/admin/roles", icon: KeyRound },
    ],
  },
  {
    group: "Academics",
    items: [
      { label: "Courses & Syllabus", to: "/admin/courses", icon: BookOpen },
      { label: "Question Bank", to: "/admin/questions", icon: HelpCircle },
      { label: "Practice Papers", to: "/admin/papers", icon: FileText },
      { label: "Memory Guard", to: "/admin/memory", icon: Brain },
      { label: "Planner", to: "/admin/planner", icon: CalendarRange },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", to: "/admin/reports", icon: ListChecks },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Support Center", to: "/admin/support", icon: LifeBuoy },
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Email Center", to: "/admin/email", icon: Mail },
      { label: "Background Jobs", to: "/admin/jobs", icon: Boxes },
      { label: "Downloads", to: "/admin/downloads", icon: Download },
      { label: "Storage", to: "/admin/storage", icon: HardDrive },
    ],
  },
  {
    group: "Revenue",
    items: [
      { label: "Subscriptions", to: "/admin/subscriptions", icon: Wallet },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    group: "Platform",
    items: [
      { label: "System Health", to: "/admin/health", icon: Gauge },
      { label: "Error Center", to: "/admin/errors", icon: Bug },
      { label: "Security Center", to: "/admin/security", icon: Shield },
      { label: "Audit Logs", to: "/admin/audit", icon: ScrollText },
      { label: "Feature Flags", to: "/admin/flags", icon: FlaskConical },
      { label: "Backups", to: "/admin/backups", icon: Database },
      { label: "Developer Center", to: "/admin/developer", icon: Terminal },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

const ALL_ITEMS = ADMIN_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarContent className="bg-card">
        <div className="flex h-16 items-center gap-2 px-4">
          <img src="/kixtologo.png" alt="" className="h-8 w-8 shrink-0 object-contain" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold leading-tight">Kixto Control</p>
            <p className="truncate text-[11px] text-muted-foreground">Super Admin</p>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {ADMIN_NAV.map((group) => (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.14em]">{group.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.to;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label} className="h-9 rounded-xl">
                          <Link to={item.to} className="flex items-center gap-2.5 text-[13px] font-medium">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };
  return { dark, toggle };
}

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { email } = useSuperAdminGate();
  const { data, isFetching, refetch } = useCommandCenter();
  const { dark, toggle } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const alerts = [
    ...(data && data.stats["openErrors"] ? [{ id: "err", text: `${data.stats["openErrors"]} unresolved errors`, to: "/admin/errors" }] : []),
    ...(data && data.stats["ticketsPending"] ? [{ id: "tic", text: `${data.stats["ticketsPending"]} pending tickets`, to: "/admin/support" }] : []),
    ...(data && data.health.some((h) => h.status === "critical")
      ? [{ id: "hea", text: "A service is reporting critical", to: "/admin/health" }]
      : []),
  ];

  async function signOut() {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
    } catch (error) {
      notify.fromError(error, { module: "super-admin", fn: "signOut", fallback: "Couldn't sign out cleanly." });
    } finally {
      navigate({ to: "/auth", replace: true });
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-[radial-gradient(1200px_600px_at_20%_-10%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)] bg-background">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
                  <span className="hidden rounded-full brand-gradient-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground sm:inline">
                    Super Admin
                  </span>
                </div>
                {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden lg:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the platform"
                  aria-label="Global search"
                  className="h-9 w-56 rounded-full pl-9 xl:w-72"
                />
                {results.length > 0 ? (
                  <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-border/60 bg-popover p-2 shadow-xl">
                    {results.map((r) => (
                      <Link
                        key={r.to}
                        to={r.to}
                        onClick={() => setQuery("")}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-accent"
                      >
                        <r.icon className="h-4 w-4" /> {r.label}
                        <span className="ml-auto text-[11px] text-muted-foreground">{r.group}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button variant="outline" size="sm" className="hidden h-9 rounded-full text-xs md:inline-flex" onClick={() => setOpen(true)}>
                <Terminal className="mr-1.5 h-3.5 w-3.5" /> ⌘K
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label="Refresh data"
                onClick={() => refetch()}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Toggle theme" onClick={toggle}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full" aria-label="System alerts">
                    <AlertTriangle className="h-4 w-4" />
                    {alerts.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 rounded-2xl p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System alerts</p>
                  {alerts.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">All systems nominal.</p>
                  ) : (
                    alerts.map((a) => (
                      <Link key={a.id} to={a.to} className="block rounded-xl px-2 py-2 text-sm hover:bg-accent">
                        {a.text}
                      </Link>
                    ))
                  )}
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 rounded-full pl-1 pr-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full brand-gradient-bg text-[11px] font-bold text-primary-foreground">
                      SA
                    </span>
                    <span className="hidden max-w-28 truncate text-xs font-medium sm:block">{email ?? "Super Admin"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel className="truncate text-xs">{email ?? "Super Admin"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <Activity className="mr-2 h-4 w-4" /> Student app
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" /> Platform settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <Separator className="opacity-0" />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
            <ModuleBoundary key={pathname} name={pathname}>
              {children}
            </ModuleBoundary>
          </main>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a module or run an action…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {ADMIN_NAV.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.to}
                  value={`${group.group} ${item.label}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: item.to });
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}