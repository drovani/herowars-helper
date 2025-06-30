import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { LoaderCircle, MoreHorizontalIcon } from "lucide-react";
import type React from "react";
import type { ReactElement } from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { navigation } from "~/data/navigation";
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

export function SiteSidebar({ settings, ...props }
  : React.ComponentProps<typeof Sidebar> & {
    settings: {
      site_title?: string;
      site_subtitle?: string;
      site_logo?: ReactElement
    }
  }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { isAuthenticated, user } = useAuth();

  const navgroups = navigation.filter(
    (group) =>
      !("roles" in group) ||
      (isAuthenticated && user?.roles.some((role) => (group.roles as ReadonlyArray<string>).includes(role)))
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-4" viewTransition>
          {settings.site_logo &&
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-background text-sidebar-primary-foreground">
              {settings.site_logo}
            </div>
          }
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{settings.site_title}</span>
            <span className="truncate text-xs">{settings.site_subtitle}</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navgroups.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>
              {group.icon && <group.icon className="inline" />}
              {group.name}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.name} className="">
                  <SidebarMenuButton asChild>
                    {"href" in item && item.href ? (
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
                  {"children" in item && item.children && (
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
                            {subnav.href ? (
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
                            ) : (<div className="flex gap-2 items-center opacity-50 cursor-default" title="Coming soon">
                              <subnav.icon className="inline" />
                              <span>{subnav.name}</span>
                            </div>)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SiteUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
