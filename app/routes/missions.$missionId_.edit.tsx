// missions.$missionId_.edit.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { data, redirect, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import log from "loglevel";
import { ZodError } from "zod";
import MissionForm from "~/components/MissionForm";
import { Badge } from "~/components/ui/badge";
import { MissionMutationSchema, type MissionMutation } from "~/data/mission.zod";
import MissionDataService from "~/services/MissionDataService";
import type { Route } from "./+types/missions.$missionId_.edit";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: `Edit ${data?.mission.name}` },
    { name: "robots", content: "noindex" },
    { rel: "canonical", href: `/missions/${data?.mission.id}` },
    {
      name: "description",
      content: `Edit details for ${data?.mission.name} mission. Internal administrative page.`,
    },
  ];
};

export const handle = {
  breadcrumb: (matches: UIMatch<Route.ComponentProps["loaderData"], unknown>) => [
    {
      href: `/missions/${matches.params.missionId}`,
      title: matches.data?.mission?.name || "Mission",
    },
    {
      title: "Edit",
    },
  ],
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  invariant(params.missionId, "Missing mission ID param.");
  const mission = await MissionDataService.getById(params.missionId);
  if (!mission) {
    throw data(null, {
      status: 404,
      statusText: `Mission with ID ${params.missionId} not found.`,
    });
  }

  return data(
    { mission },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.missionId, "Missing mission ID param");

  const formData = await request.formData();
  const data = JSON.parse(formData.get("mission") as string);

  const updateResults = await MissionDataService.update(params.missionId, data as MissionMutation);
  if (updateResults instanceof ZodError) {
    log.error("Captured validation ZodError:", JSON.stringify(updateResults.format(), null, 2));
    return data({ errors: updateResults.format() }, { status: 400 });
  }

  return redirect(`/missions/${updateResults.id}`);
};

export default function EditMission({ loaderData, actionData }: Route.ComponentProps) {
  const { mission } = loaderData;

  try {
    const form = useForm<MissionMutation>({
      resolver: zodResolver(MissionMutationSchema),
      defaultValues: {
        chapter: mission.chapter,
        chapter_title: mission.chapter_title,
        mission_number: mission.mission_number,
        name: mission.name,
        boss: mission.boss || "",
      },
    });

    return (
      <div className="space-y-6">
        {/* Mission Info Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mission.chapter}-{mission.mission_number}: {mission.name}
            </h1>
            <div className="flex gap-2">
              <Badge variant="secondary">Chapter {mission.chapter}</Badge>
              <Badge variant="outline">{mission.chapter_title}</Badge>
              {mission.boss && (
                <Badge variant="default">Boss: {mission.boss}</Badge>
              )}
            </div>
          </div>
        </div>
        <MissionForm form={form} />
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8 bg-red-100 border-4 border-red-500">
        <h1 className="text-4xl font-bold text-red-800">FORM CREATION ERROR</h1>
        <p className="text-2xl text-red-700 mt-4">Error: {String(error)}</p>
      </div>
    );
  }
}