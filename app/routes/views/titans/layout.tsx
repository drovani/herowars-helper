import { Outlet, type UIMatch } from "react-router";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/titans",
    title: "Titans",
  }),
};

export default function Titans() {
  return <Outlet />;
}
