import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  LogOut,
  Menu,
  MessagesSquare,
  ScanLine,
  Settings,
  ShoppingBasket,
  User as UserIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { LanguageSelect } from "@/components/app/LanguageSelect";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", labelKey: "nav.diagnosis", icon: ScanLine },
  { to: "/app/library", labelKey: "nav.library", icon: BookOpen },
  { to: "/app/marketplace", labelKey: "nav.marketplace", icon: ShoppingBasket },
  { to: "/app/forum", labelKey: "nav.forum", icon: MessagesSquare },
  { to: "/app/advisor", labelKey: "nav.advisor", icon: Bot },
] as const;

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Farmer";
  const initials = displayName.slice(0, 2).toUpperCase();

  const isActive = (to: string) => (to === "/app" ? pathname === "/app" : pathname.startsWith(to));

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/85 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <Logo to="/app" />

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    isActive(item.to)
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="hidden md:block">
              <LanguageSelect />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="hidden shrink-0 rounded-full ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:block"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-gradient-leaf text-xs font-bold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings">
                    <UserIcon className="mr-2 h-4 w-4" aria-hidden />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" aria-hidden />
                  {t("app.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[86vw] max-w-sm">
                <SheetHeader>
                  <SheetTitle className="text-left">{displayName}</SheetTitle>
                </SheetHeader>
                <div className="space-y-5 px-4 pb-8">
                  <div>
                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {t("app.language")}
                    </p>
                    <LanguageSelect className="w-full" />
                  </div>

                  <nav className="grid gap-1">
                    {[...NAV, { to: "/app/settings", labelKey: "nav.settings", icon: Settings }].map(
                      (item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                            isActive(item.to)
                              ? "bg-primary-soft text-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                          {t(item.labelKey)}
                        </Link>
                      ),
                    )}
                  </nav>

                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" aria-hidden />
                    {t("app.signOut")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 lg:px-6 lg:pb-10">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                isActive(item.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="max-w-full truncate px-1">{t(item.labelKey)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
