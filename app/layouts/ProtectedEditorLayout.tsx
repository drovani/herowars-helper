import ProtectedLayout from "~/layouts/ProtectedLayout";

export default function ProtectedEditorLayout() {
  return ProtectedLayout({ roles: ["admin", "editor"] });
}
