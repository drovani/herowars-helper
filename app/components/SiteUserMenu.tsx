import { BadgeCheck, ChevronsUpDown, LogInIcon, LogOut } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar";
import { useNetlifyAuth } from "~/hooks/useNetlifyAuth";
import { Button } from "./ui/button";

export function SiteUserMenu() {
  const { isMobile } = useSidebar();
  const { isAuthenticated, user, authenticate, signout } = useNetlifyAuth();

  const userWithDefaults = useMemo(() => {
    return {
      avatar: user?.user_metadata?.avatar_url || "/images/heroes/mushy-and-shroom.png",
      fallback:
        user?.user_metadata?.full_name
          ?.split(" ")
          .map((n) => n[0])
          .join("") || "AS",
      name: user?.user_metadata?.full_name || "Anonymous Shroom",
      email: user?.email || "anonymousshroom@example.com",
    };
  }, [user]);

  return (
    <div>
      {isAuthenticated && user !== null ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={`${userWithDefaults.avatar}`} alt={userWithDefaults.name} />
                    <AvatarFallback className="rounded-lg">{userWithDefaults.fallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userWithDefaults.name}</span>
                    <span className="truncate text-xs">{userWithDefaults.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={`${userWithDefaults.avatar}`} alt={userWithDefaults.name} />
                      <AvatarFallback className="rounded-lg">{userWithDefaults.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userWithDefaults.name}</span>
                      <span className="truncate text-xs">{userWithDefaults.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2" viewTransition>
                      <BadgeCheck />
                      Account
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signout(() => window.location.reload());
                  }}
                  className="w-full flex items-center gap-2"
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : (
        <Button
          variant={"outline"}
          className="w-full flex items-center gap-2"
          onClick={() => {
            authenticate((_) => window.location.reload());
          }}
        >
          <LogInIcon />
          <span>Sign in</span>
        </Button>
      )}
    </div>
  );
}