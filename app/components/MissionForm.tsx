import { useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { useNavigate, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { HeroRecord } from "~/data/hero.zod";
import { MissionMutationSchema, type MissionMutation } from "~/data/mission.zod";
import HeroDataService from "~/services/HeroDataService";

interface MissionFormProps {
  form: UseFormReturn<MissionMutation>;
}

export default function MissionForm({ form }: MissionFormProps) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const [heroes, setHeroes] = useState<HeroRecord[]>([]);
  const [isLoadingHeroes, setIsLoadingHeroes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadHeroes = async () => {
      try {
        const heroesData = await HeroDataService.getAll();
        setHeroes(heroesData);
      } catch (error) {
        console.error("Failed to load heroes:", error);
        setHeroes([]);
      } finally {
        setIsLoadingHeroes(false);
      }
    };
    loadHeroes();
  }, []);

  const onSubmit = async (submittedData: MissionMutation) => {
    try {
      setIsSubmitting(true);
      const validated = MissionMutationSchema.parse(submittedData);

      const formData = new FormData();
      formData.append("mission", JSON.stringify(validated));
      submit(formData, { method: "post" });
    } catch (error) {
      console.error("Mission form validation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="chapter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chapter</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mission_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mission Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="chapter_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter chapter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter mission name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="boss"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Boss (Optional)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)} 
                value={field.value || "none"} 
                disabled={isLoadingHeroes}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingHeroes ? "Loading heroes..." : "Select a boss hero"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {heroes.map((hero) => (
                    <SelectItem key={hero.slug} value={hero.name}>
                      {hero.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isLoadingHeroes}>
            {isSubmitting ? "Saving..." : "Save Mission"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}