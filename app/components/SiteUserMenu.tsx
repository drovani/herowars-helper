import { BadgeCheck, ChevronsUpDown, LogInIcon, LogOut } from "lucide-react";
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
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "./ui/button";

export function SiteUserMenu() {
  const { isMobile, state } = useSidebar();
  const { isAuthenticated, user, signOut } = useAuth();

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
                    <AvatarImage src={`${user.avatar}`} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.fallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={`${user.avatar}`} alt={user.name} />
                      <AvatarFallback className="rounded-lg">{user.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
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
                <DropdownMenuItem onClick={signOut} className="w-full flex items-center gap-2">
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : state === "expanded" ? (
        <Button variant={"outline"} asChild className="w-full flex items-center gap-2">
          <Link to="/login">
            <LogInIcon />
            <span>Sign in</span>
          </Link>
        </Button>
      ) : (
        <LogInIcon
          className="size-8 p-0.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          onClick={signOut}
        />
      )}
    </div>
  );
}
