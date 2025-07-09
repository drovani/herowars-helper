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
import { MissionRepository, type Mission, type MissionUpdate } from "~/repositories/MissionRepository";
import type { Route } from "./+types/missions.$missionId_.edit";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: `Edit ${data?.mission.name}` },
    { name: "robots", content: "noindex" },
    { rel: "canonical", href: `/missions/${data?.mission.slug}` },
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

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.missionId, "Missing mission ID param.");
  
  const missionRepo = new MissionRepository(request);
  const missionResult = await missionRepo.findById(params.missionId);
  
  if (missionResult.error) {
    throw data(null, {
      status: 500,
      statusText: "Failed to load mission",
    });
  }

  const mission = missionResult.data;
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
  const missionData = JSON.parse(formData.get("mission") as string);

  const missionRepo = new MissionRepository(request);
  
  // Convert MissionMutation format to Repository format
  const updateData: MissionUpdate = {
    name: missionData.name,
    hero_slug: missionData.boss || null,
    // Note: chapter_id and slug cannot be updated through this form
  };

  const updateResult = await missionRepo.update(params.missionId, updateData);
  
  if (updateResult.error) {
    log.error("Mission update failed:", updateResult.error);
    return data({ errors: { _form: [updateResult.error.message] } }, { status: 400 });
  }

  return redirect(`/missions/${updateResult.data?.slug}`);
};

export default function EditMission({ loaderData, actionData }: Route.ComponentProps) {
  const { mission } = loaderData;

  try {
    const form = useForm<MissionMutation>({
      resolver: zodResolver(MissionMutationSchema),
      defaultValues: {
        chapter: mission.chapter_id,
        chapter_title: "", // This would need to be fetched from the chapter table
        mission_number: parseInt(mission.slug.split('-')[1]), // Extract from slug
        name: mission.name,
        boss: mission.hero_slug || "",
      },
    });

    return (
      <div className="space-y-6">
        {/* Mission Info Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mission.slug}: {mission.name}
            </h1>
            <div className="flex gap-2">
              <Badge variant="secondary">Chapter {mission.chapter_id}</Badge>
              {mission.hero_slug && (
                <Badge variant="default">Boss: {mission.hero_slug}</Badge>
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