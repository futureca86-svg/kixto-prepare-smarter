import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function subjectGroupCodes(groupCode: string | null | undefined): string[] {
  if (!groupCode) return [];
  if (groupCode === "both") return ["group1", "group2"];
  return [groupCode];
}

export const coursesQuery = queryOptions({
  queryKey: ["ca_courses"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("ca_courses")
      .select("code, name, description, sort_order")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60_000,
});

export const groupsQuery = (courseCode: string | null) =>
  queryOptions({
    queryKey: ["ca_groups", courseCode],
    queryFn: async () => {
      if (!courseCode) return [];
      const { data, error } = await supabase
        .from("ca_groups")
        .select("code, name, description, sort_order")
        .eq("course_code", courseCode)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(courseCode),
    staleTime: 5 * 60_000,
  });

export const subjectsQuery = (courseCode: string | null, groupCode: string | null) =>
  queryOptions({
    queryKey: ["ca_subjects", courseCode, groupCode],
    queryFn: async () => {
      const codes = subjectGroupCodes(groupCode);
      if (!courseCode || codes.length === 0) return [];
      const { data, error } = await supabase
        .from("ca_subjects")
        .select("id, name, short_name, group_code, sort_order")
        .eq("course_code", courseCode)
        .in("group_code", codes)
        .order("group_code")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(courseCode && groupCode),
    staleTime: 5 * 60_000,
  });

export const STUDY_TIMES = [
  { value: "1-2", label: "1 – 2 Hours", hint: "Light & steady" },
  { value: "2-4", label: "2 – 4 Hours", hint: "Balanced routine" },
  { value: "4-6", label: "4 – 6 Hours", hint: "Serious prep" },
  { value: "6+", label: "6+ Hours", hint: "Full-time mode" },
];

export const GOALS = [
  { value: "first_attempt", label: "Pass in First Attempt" },
  { value: "high_marks", label: "Score High Marks" },
  { value: "conceptual", label: "Conceptual Learning" },
  { value: "consistency", label: "Consistency" },
  { value: "time_management", label: "Time Management" },
];