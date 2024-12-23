import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { LoaderCircle, MoreHorizontalIcon } from "lucide-react";
import type React from "react";
import { Link, NavLink } from "react-router";
import { navigation } from "~/data/navigation";
import { useNetlifyAuth } from "~/hooks/useNetlifyAuth";
import { cn } from "~/lib/utils";
import { SiteSwitcher } from "./SiteSwitcher";
import { SiteUser } from "./SiteUser";
import { Button } from "./ui/button";
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

  const { isAuthenticated, user, authenticate } = useNetlifyAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SiteSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hero Wars Helper Tools</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map((item) => (
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
        {isAuthenticated && user !== null ? (
          <SiteUser user={user} />
        ) : (
          <Button
            variant={"outline"}
            onClick={() => {
              authenticate((_) => window.location.reload());
            }}
          >
            Sign in
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
