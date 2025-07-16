import type { Route } from "./+types/index";

export const meta = (_: Route.MetaArgs) => {
  return [{ name: "robots", content: "noindex" }];
};

export default function PlayerAdmin() {
  return <></>;
}
