import { Outlet, type UIMatch } from "react-router";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/equipment",
    title: "Equipment",
  }),
};

export default function Equipment() {
  return <Outlet />;
}
