import { createFileRoute } from "@tanstack/react-router";
import { DataPage } from "@/components/admin/DataPage";
import { supabase } from "@/lib/admin/list";
import { adminHead, fmt, text, type AnyRow } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  head: adminHead("Courses & Syllabus", "CA courses available to students."),
  component: () => (
    <DataPage<AnyRow>
      title="Courses & Syllabus"
      subtitle="CA courses available to students."
      heading="Course catalogue"
      description="Courses, groups and subjects power onboarding."
      queryKey={["courses"]}
      build={() => supabase.from("ca_courses").select("*").order("sort_order", { ascending: false }).limit(300) as never}
      empty="No courses configured."
      columns={[
        { label: "Code", render: (r) => text(r["code"]) },
        { label: "Name", render: (r) => text(r["name"]) },
        { label: "Description", render: (r) => text(r["description"]) },
      ]}
    />
  ),
});
