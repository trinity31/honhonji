import type { Database } from "database.types";

import makeServerClient from "~/core/lib/supa-client.server";
import { createSupabaseBrowserClient } from "~/core/lib/supa-client.client";

/**
 * Get all courses created by the current user
 * @param request The incoming request object
 * @returns Array of courses with their details
 */
export const getUserCourses = async (request: Request) => {
  try {
    const [client] = makeServerClient(request);

    // Get the current user's ID
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    
    if (userError) {
      console.error("Supabase user error:", userError);
      return [];
    }
    
    if (!user || !user.id) {
      console.log("No authenticated user found");
      return [];
    }

    // Fetch courses created by the user
    const { data: courses, error: coursesError } = await client
      .from("courses")
      .select(
        `
        id,
        name,
        description
      `,
      )
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      return [];
    }

    return courses || [];
  } catch (error) {
    console.error("Unexpected error in getUserCourses:", error);
    return [];
  }
};

/**
 * 장소가 특정 코스에 포함되어 있는지 확인하는 함수
 * @param placeId 확인할 장소 ID
 * @returns 장소가 포함된 코스 ID의 배열
 */
export const getPlaceInCourses = async (placeId: number) => {
  try {
    const client = createSupabaseBrowserClient();

    // 현재 사용자의 ID 가져오기
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    
    if (userError || !user) {
      console.error("Supabase user error:", userError);
      return [];
    }
    
    // 사용자가 소유한 코스 중 해당 장소가 포함된 코스 가져오기
    const { data, error } = await client
      .from("course_places")
      .select(
        `
        course_id,
        courses!inner(profile_id)
      `,
      )
      .eq("place_id", placeId)
      .eq("courses.profile_id", user.id);

    if (error) {
      console.error("Error fetching course places:", error);
      return [];
    }

    // course_id만 배열로 추출
    return data ? data.map(item => item.course_id) : [];
  } catch (error) {
    console.error("Unexpected error in getPlaceInCourses:", error);
    return [];
  }
};
