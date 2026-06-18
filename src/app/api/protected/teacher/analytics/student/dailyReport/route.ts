import { CompletedQuestionsDAO } from "@/src/app/api/lib/DAOs/completedQuestionsDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { URLAdapter } from "@/src/app/api/lib/middleware/urlAdapter";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import { ReportGenerator } from "@/src/app/api/lib/reportHelpers/reportGenerator";
import { DailyReport } from "@/src/app/api/lib/types/reportTypes";
import { DateTime } from "@/src/app/api/lib/utils/dateTime";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";

export async function GET(req: Request) {
  type StudentDailyReportResponse = {
    student_id: string;
    student_name: string;
    student_email: string;
    report: DailyReport;
  };

  const schema = z.object({
    student_id: z.string().uuid(),
    year: z.string(),
    date: z.string(),
    subject: z.string(),
  });

  try {
    const request = new URLAdapter(req, schema);
    request.init();

    const student_id = request.getURLProperty("student_id");
    const year = request.getURLProperty("year");
    const date = request.getURLProperty("date");
    const subject = request.getURLProperty("subject");

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    const schoolId = user.getSchoolId();
    if (!schoolId) {
      throw new FlexibleError("User does not have a school ID", 400);
    }

    // Verify the student exists and belongs to the teacher's school
    const student = await userDAO.getUser(student_id);
    if (!student) {
      throw new FlexibleError("Student not found", 404);
    }

    // Check if student belongs to teacher's school
    if (student.getSchoolId() !== schoolId) {
      throw new FlexibleError("Student does not belong to your school", 403);
    }

    // Verify student role
    student.assertRole(["student"]);

    const previousDate = DateTime.getPastDate(date, 1);

    const cqDAO = new CompletedQuestionsDAO(supabaseService);

    // Get student's completed questions for the specified date
    const currentDayCQ = await cqDAO.getDayCompletedQuestions(
      student_id,
      date,
      year,
      subject,
    );

    if (!currentDayCQ.length) {
      throw new FlexibleError("No reports for this day", 404);
    }

    // Get previous day's data for comparison
    const previousDayCQ = await cqDAO.getDayCompletedQuestions(
      student_id,
      previousDate,
      year,
      subject,
    );

    // Get historical data for context
    const pastCQ = await cqDAO.getPreviousCompletedQuestions(
      student_id,
      previousDate,
      year,
      subject,
    );

    // Generate the report using existing ReportGenerator
    const reportGenerator = new ReportGenerator(
      currentDayCQ,
      previousDayCQ,
      pastCQ,
    );

    const report = reportGenerator.generate_daily_report();

    // Get student details
    const studentDetails = await userDAO.getUser(student_id);

    const response: StudentDailyReportResponse = {
      student_id: student_id,
      student_name: `${studentDetails.getFirstName()} ${studentDetails.getLastName()}`,
      student_email: studentDetails.getEmail(),
      report: report,
    };

    return ResponseWrapper.success(response, "Student daily report retrieved successfully");
  } catch (error) {
    return ResponseWrapper.error(error);
  }
}
