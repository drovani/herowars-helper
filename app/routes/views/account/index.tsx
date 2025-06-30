import { Outlet, type UIMatch } from "react-router";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/account",
    title: "Account",
  }),
};

export default function Account() {
  return <Outlet />;
}
