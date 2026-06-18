import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export async function GET(req: Request) {
  type QuestionCategoriesResponse = {
    subjects: {
      name: string;
      total_questions: number;
      outer_categories: number;
      inner_categories: number;
      difficulties: number;
      years: number;
    }[];
    outer_categories: {
      id: number;
      count: number;
    }[];
    inner_categories: {
      id: number;
      count: number;
    }[];
    difficulties: {
      level: number;
      count: number;
    }[];
    years: {
      year: number;
      count: number;
    }[];
    total_questions: number;
  };

  try {
    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    // Get subjects with their statistics
    const { data: subjectsData, error: subjectsError } = await supabaseService
      .from("primary_questions")
      .select("subject, outer_category, inner_category, difficulty, year")
      .eq("audited", true);

    if (subjectsError) throw subjectsError;

    // Process subjects data
    const subjectStats = new Map();
    const outerCategoryStats = new Map();
    const innerCategoryStats = new Map();
    const difficultyStats = new Map();
    const yearStats = new Map();

    subjectsData?.forEach((question) => {
      // Subject statistics
      if (!subjectStats.has(question.subject)) {
        subjectStats.set(question.subject, {
          name: question.subject,
          total_questions: 0,
          outer_categories: new Set(),
          inner_categories: new Set(),
          difficulties: new Set(),
          years: new Set(),
        });
      }
      const subject = subjectStats.get(question.subject);
      subject.total_questions++;
      subject.outer_categories.add(question.outer_category);
      subject.inner_categories.add(question.inner_category);
      subject.difficulties.add(question.difficulty);
      subject.years.add(question.year);

      // Global statistics
      outerCategoryStats.set(
        question.outer_category,
        (outerCategoryStats.get(question.outer_category) || 0) + 1
      );
      innerCategoryStats.set(
        question.inner_category,
        (innerCategoryStats.get(question.inner_category) || 0) + 1
      );
      difficultyStats.set(
        question.difficulty,
        (difficultyStats.get(question.difficulty) || 0) + 1
      );
      yearStats.set(question.year, (yearStats.get(question.year) || 0) + 1);
    });

    // Convert subjects data
    const subjects = Array.from(subjectStats.values())
      .map((subject) => ({
        name: subject.name,
        total_questions: subject.total_questions,
        outer_categories: subject.outer_categories.size,
        inner_categories: subject.inner_categories.size,
        difficulties: subject.difficulties.size,
        years: subject.years.size,
      }))
      .sort((a, b) => b.total_questions - a.total_questions);

    // Convert global statistics
    const outer_categories = Array.from(outerCategoryStats.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => a.id - b.id);

    const inner_categories = Array.from(innerCategoryStats.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => a.id - b.id);

    const difficulties = Array.from(difficultyStats.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => a.level - b.level);

    const years = Array.from(yearStats.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    const total_questions = subjectsData?.length || 0;

    const data: QuestionCategoriesResponse = {
      subjects,
      outer_categories,
      inner_categories,
      difficulties,
      years,
      total_questions,
    };

    return ResponseWrapper.success(
      "Question categories retrieved successfully",
      data
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to get question categories",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
