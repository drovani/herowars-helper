import { Outlet, type UIMatch } from "react-router";
import ProtectedRoute from "~/ProtectedRoute";

export const handle = {
  breadcrumb: (_: UIMatch<unknown, unknown>) => ({
    href: "/admin",
    title: "Admin",
  }),
};

export default function Admin() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <Outlet />
    </ProtectedRoute>
  );
}
