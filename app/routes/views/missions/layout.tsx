import { Outlet, type UIMatch } from "react-router";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/missions",
    title: "Missions",
  }),
};

export default function Missions() {
  return <Outlet />;
}
