import {
  BarChart3Icon,
  DatabaseZapIcon,
  DropletIcon,
  FileJson2Icon,
  MapIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SwordIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";

interface NavigationGroup {
  name: string;
  icon?: React.ComponentType<any>;
  items: NavigationItem[];
  roles?: string[];
}

interface NavigationItem {
  name: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: NavigationItem[];
  reloadDocument?: boolean;
}

export const navigation: NavigationGroup[] = [
  {
    name: "Hero Wars Helper Tools",
    items: [
      {
        name: "Heroes",
        icon: UsersRoundIcon,
        href: "/heroes",
        children: [
          {
            name: "Export as JSON",
            icon: FileJson2Icon,
            href: "/heroes.json",
          },
        ],
      },
      { name: "Titans", icon: SwordIcon, href: "/titans" },
      {
        name: "Equipment",
        icon: ShieldIcon,
        href: "/equipment",
        children: [
          {
            name: "Export as JSON",
            icon: FileJson2Icon,
            href: "/equipment.json",
          },
        ],
      },
      {
        name: "Missions",
        icon: MapIcon,
        href: "/missions",
        children: [
          {
            name: "Export as JSON",
            icon: FileJson2Icon,
            href: "/missions.json",
          },
        ],
      },
      { name: "Merchant", icon: ShoppingBagIcon },
      { name: "Hydras", icon: DropletIcon },
    ],
  },
  {
    name: "Guild Coordination Tools",
    items: [
      { name: "Guild Roster", icon: UsersRoundIcon },
      { name: "Hydra Planning", icon: DropletIcon },
    ],
  },
  {
    name: "Administration",
    roles: ["admin"],
    items: [
      {
        name: "Data Setup",
        icon: DatabaseZapIcon,
        href: "/admin/setup",
      },
      {
        name: "User Management",
        icon: UsersIcon,
        href: "/admin/users",
      },
      {
        name: "Test Coverage",
        icon: BarChart3Icon,
        href: "/admin/test-coverage",
      },
    ],
  },
] as const;
