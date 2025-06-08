import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { LoaderCircle, MoreHorizontalIcon } from "lucide-react";
import type React from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { navigation } from "~/data/navigation";
import HeroWarsLogo from "~/images/hero-wars-alliance-logo.webp";
import { cn } from "~/lib/utils";
import { SiteUserMenu } from "./SiteUserMenu";
import { DropdownMenuContent } from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";

export function SiteSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isAuthenticated, user } = useAuth();

  const navitems = navigation.filter(
    (item) =>
      !("roles" in item) ||
      (isAuthenticated && user?.roles.some((role) => (item.roles as ReadonlyArray<string>).includes(role)))
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-4" viewTransition>
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-background text-sidebar-primary-foreground">
            <img src={HeroWarsLogo} alt="Hero Wars Helper" className="size-8" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">HW Helper</span>
            <span className="truncate text-xs">Tools for players</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hero Wars Helper Tools</SidebarGroupLabel>
          <SidebarMenu>
            {navitems.map((item) => (
              <SidebarMenuItem key={item.name} className="">
                <SidebarMenuButton asChild>
                  {"href" in item ? (
                    <NavLink to={item.href} viewTransition onClick={isMobile ? () => setOpenMobile(false) : undefined}>
                      {({ isPending, isActive }) => (
                        <>
                          <item.icon className={cn("inline", isActive && "fill-green-300")} />
                          <span>{item.name}</span>
                          {isPending && <LoaderCircle className="animate-spin" />}
                        </>
                      )}
                    </NavLink>
                  ) : (
                    <div className="flex gap-2 items-center opacity-50 cursor-default" title="Coming soon">
                      <item.icon className="inline" />
                      <span>{item.name}</span>
                    </div>
                  )}
                </SidebarMenuButton>
                {"children" in item && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontalIcon />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg p-2"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      {item.children.map((subnav) => (
                        <DropdownMenuItem key={subnav.name} asChild>
                          <Link
                            to={subnav.href}
                            className="flex gap-2 items-center text-sm"
                            reloadDocument={"reloadDocument" in subnav && subnav.reloadDocument}
                            onClick={isMobile ? () => setOpenMobile(false) : undefined}
                            viewTransition
                          >
                            <subnav.icon className="text-muted-foreground w-8" />
                            <span>{subnav.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SiteUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
