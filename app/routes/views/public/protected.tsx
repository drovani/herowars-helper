import { type LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return redirect("/login");
  }

  return data;
};

export default function ProtectedPage() {
  let data = useLoaderData<typeof loader>();

  return (
    <div className="flex items-center justify-center h-screen gap-2">
      <p>
        Hello{" "}
        <span className="text-primary font-semibold">{data.user.email}</span>
      </p>
      <a href="/logout">
        <Button>Logout</Button>
      </a>
    </div>
  );
}
