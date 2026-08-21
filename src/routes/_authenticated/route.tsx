import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
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
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Search, FolderKanban, CreditCard, Settings, Radar, LogOut, Mail } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { WelcomeModal } from "@/components/WelcomeModal";
import { ThemeToggle } from "@/components/theme-provider";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Find Leads", url: "/leads", icon: Search },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Messages", url: "/messages", icon: Mail },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;


function AuthedLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider>
      <WelcomeModal userId={user.id} />
      <div className="min-h-screen flex w-full bg-ls-surface">
        <Sidebar collapsible="icon" className="hidden md:flex">
          <SidebarHeader>
            <Link to="/" className="flex items-center gap-2 px-2 py-3 text-ls-text" title="Back to home">
              <Radar className="h-5 w-5 text-primary shrink-0" />
              <span className="font-medium uppercase tracking-wider text-sm group-data-[collapsible=icon]:hidden">Leadora</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 py-2 text-xs text-ls-text-muted truncate group-data-[collapsible=icon]:hidden">
              {user.email}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-ls-border px-4 gap-2">
            <SidebarTrigger className="hidden md:inline-flex" />
            <Link to="/" className="flex items-center gap-2 text-ls-text md:hidden" title="Back to home">
              <Radar className="h-4 w-4 text-primary" />
              <span className="font-medium uppercase tracking-wider text-xs">Leadora</span>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <button onClick={signOut} className="text-xs text-ls-text-muted hover:text-ls-text md:hidden flex items-center gap-1 px-2">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <Outlet />
          </main>

          {/* Footer logo */}
          <footer className="border-t border-ls-border px-4 py-4 md:py-3">
            <Link to="/" className="flex items-center justify-center gap-2 text-ls-text-muted hover:text-ls-text transition-colors" title="Back to home">
              <Radar className="h-4 w-4 text-primary" />
              <span className="font-medium uppercase tracking-wider text-xs">Leadora</span>
            </Link>
          </footer>
        </div>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Primary"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ls-border bg-ls-surface/95 backdrop-blur grid grid-cols-6 pb-[env(safe-area-inset-bottom)]"
        >
          {NAV.map((item) => {
            const active = pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                aria-label={item.title}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] uppercase tracking-wider min-h-11 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors ${
                  active ? "text-primary" : "text-ls-text-muted hover:text-ls-text"
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{item.title.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </SidebarProvider>
  );
}

