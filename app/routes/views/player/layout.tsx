// ABOUTME: Player layout component provides breadcrumb navigation for player routes
// ABOUTME: Serves as the parent layout for all player-related pages including roster and activity
import { Outlet, type UIMatch } from "react-router";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/player",
    title: "Player",
  }),
};

export default function PlayerLayout() {
  return <Outlet />;
}