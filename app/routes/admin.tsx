import type { Route } from "./+types/admin";

export const meta = (_: Route.MetaArgs) => {
  return [
    { name: "robots", content: "noindex" },
    {
      name: "description",
      content: `Internal administrative section.`,
    },
  ];
};

export default function Admin() {
  return <></>;
}
