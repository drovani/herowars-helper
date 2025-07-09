import { Outlet, type UIMatch } from "react-router";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/heroes",
    title: "Heroes",
  }),
};

export default function Heroes() {
  return <Outlet />;
}
