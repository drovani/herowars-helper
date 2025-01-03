import { ChevronDown, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar";
import HeroWarsLogo from "~/images/hero-wars-alliance-logo.webp";
import HSMercsIcon from "~/images/hsmercs-helper-icon.png";

const tools: {
  name: string;
  logo: string | ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  subtext?: string;
  href: string;
}[] = [
  {
    name: "HW Helper",
    logo: HeroWarsLogo,
    subtext: "Tools for players",
    href: "/",
  },
  {
    name: "HSMercs Helper",
    logo: HSMercsIcon,
    href: "https://hsmercs.rovani.net",
  },
];

export function SiteSwitcher() {
  const { isMobile } = useSidebar();
  const activeTool = tools[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-background text-sidebar-primary-foreground">
                {typeof activeTool.logo === "string" && (
                  <img src={activeTool.logo} alt={activeTool.name} className="size-8" />
                )}
                {typeof activeTool.logo !== "string" && <activeTool.logo className="size-8" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTool.name}</span>
                <span className="truncate text-xs">{activeTool.subtext}</span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Rovani.net Projects</DropdownMenuLabel>
            {tools.map((tool) => (
              <DropdownMenuItem key={tool.name} className="gap-2 p-2">
                <Link to={tool.href} className="flex gap-2 items-center">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {typeof tool.logo === "string" ? (
                      <img src={tool.logo} alt={tool.name} className="size-4 shrink-0" />
                    ) : (
                      <tool.logo className="size-4 shrink-0" />
                    )}
                  </div>
                  {tool.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
