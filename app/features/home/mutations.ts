import { z } from "zod";
import { eq, sql } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { courses, coursePlaces } from "~/features/places/schema";

export const createCourseSchema = z.object({
  name: z.string().min(1, "코스 이름은 필수입니다."),
  description: z.string().optional(),
  profile_id: z.string().uuid("Invalid user ID"),
});

export const createCourse = async (
  input: z.infer<typeof createCourseSchema>,
) => {
  const result = createCourseSchema.safeParse(input);

  if (!result.success) {
    // ZodError를 re-throw하거나 커스텀 에러를 던지는 것이 더 나을 수 있습니다.
    throw new Error(`Invalid input: ${result.error.message}`);
  }

  const [newCourse] = await db
    .insert(courses)
    .values({
      name: result.data.name,
      description: result.data.description,
      profile_id: result.data.profile_id,
    })
    .returning();

  return newCourse;
};

/**
 * 하나의 코스에 장소를 추가하는 함수
 */
export const addPlaceToCourse = async (
  courseId: number,
  placeId: number
) => {
  try {
    // 코스에 존재하는 장소 수 조회하여 order 값 계산
    const existingPlacesCount = await db
      .select({ count: sql`count(*)` })
      .from(coursePlaces)
      .where(eq(coursePlaces.course_id, courseId));
    
    const nextOrder = Number(existingPlacesCount[0]?.count || 0) + 1;
    
    // 장소 추가
    const [result] = await db
      .insert(coursePlaces)
      .values({
        course_id: courseId,
        place_id: placeId,
        order: nextOrder
      })
      .returning();
    
    return result;
  } catch (error: any) {
    if (error.message?.includes('duplicate key')) {
      throw new Error('이미 코스에 추가된 장소입니다.');
    }
    throw error;
  }
};

/**
 * 여러 코스에 한 장소를 추가하는 함수
 */
export const addPlaceToCourses = async (
  courseIds: number[],
  placeId: number
) => {
  const results = [];
  const errors = [];
  
  for (const courseId of courseIds) {
    try {
      const result = await addPlaceToCourse(courseId, placeId);
      results.push(result);
    } catch (error: any) {
      errors.push({ courseId, error: error.message });
    }
  }
  
  return { results, errors };
};

/**
 * 코스에서 장소를 삭제하는 함수
 */
export const removePlaceFromCourse = async (
  courseId: number,
  placeId: number
) => {
  try {
    // 코스에서 장소 삭제
    const result = await db
      .delete(coursePlaces)
      .where(
        sql`${coursePlaces.course_id} = ${courseId} AND ${coursePlaces.place_id} = ${placeId}`
      )
      .returning();
    
    // 삭제된 장소 이후의 order 값 재정렬
    await db.execute(
      sql`UPDATE ${coursePlaces}
        SET "order" = "order" - 1
        WHERE ${coursePlaces.course_id} = ${courseId}
        AND "order" > (SELECT "order" FROM ${coursePlaces}
                      WHERE ${coursePlaces.course_id} = ${courseId}
                      AND ${coursePlaces.place_id} = ${placeId})`
    );
    
    return result[0];
  } catch (error: any) {
    throw error;
  }
};
