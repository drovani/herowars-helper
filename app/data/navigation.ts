import {
  DropletIcon,
  FileJson2Icon,
  FileWarningIcon,
  MapIcon,
  PresentationIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StoreIcon,
  SwordIcon,
  UsersIcon,
} from "lucide-react";

export const navigation = [
  {
    name: "Heroes",
    icon: UsersIcon,
    href: "/heroes",
    children: [
      {
        name: "Export as JSON",
        href: "/heroes.json",
        icon: FileJson2Icon,
        reloadDocument: true,
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
        href: "/equipment.json",
        icon: FileJson2Icon,
        reloadDocument: true,
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
        href: "/missions.json",
        icon: FileJson2Icon,
        reloadDocument: true,
      },
    ],
  },
  { name: "Merchant", icon: ShoppingBagIcon },
  { name: "Hydras", icon: DropletIcon },
  {
    name: "Admin Setup",
    icon: PresentationIcon,
    href: "/admin/setup",
    roles: ["admin"],
    children: [
      {
        name: "Force reload hero records",
        href: "/admin/setup?mode=force&data=heroes",
        icon: UsersIcon,
      },
      {
        name: "Force reload all records",
        href: "/admin/setup?mode=force",
        icon: FileWarningIcon,
      },
      {
        name: "Parse Store Data",
        href: "/admin/parse",
        icon: StoreIcon,
      },
    ],
  },
] as const;
