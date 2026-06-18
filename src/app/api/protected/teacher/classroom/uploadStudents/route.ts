import { ClassroomDAO } from "@/src/app/api/lib/DAOs/classroomDAO";
import { UserDAO } from "@/src/app/api/lib/DAOs/userDAO";
import { Auth } from "@/src/app/api/lib/middleware/auth";
import { Supabase } from "@/src/app/api/lib/models/supabase";
import {
  UserClassroomID,
  CSVUploadResponse,
} from "@/src/app/api/lib/types/classroomTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { z } from "zod";
import csv from "csv-parser";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const classroom_id = formData.get("classroom_id") as string;

    // Validate inputs
    if (!file) {
      throw new FlexibleError("No file provided", 400);
    }

    if (!classroom_id) {
      throw new FlexibleError("Classroom ID is required", 400);
    }

    const classroomId = parseInt(classroom_id);
    if (isNaN(classroomId)) {
      throw new FlexibleError("Invalid classroom ID", 400);
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      throw new FlexibleError("Only CSV files are allowed", 400);
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new FlexibleError("File size too large. Maximum 5MB allowed", 400);
    }

    const _supabase = new Supabase();
    const supabase = _supabase.getAuthClient();
    const supabaseService = _supabase.getServiceClient();

    const auth = new Auth(supabase);
    await auth.init();

    const userDAO = new UserDAO(supabaseService);
    const user = await userDAO.getUser(auth.getUserId());
    user.assertRole(["teacher"]);
    user.assertPaying(true);

    // Verify teacher has access to this classroom
    const classroomDAO = new ClassroomDAO(supabaseService);
    const classroomDetail = await classroomDAO.getClassroomParticipants(
      user.getSchoolId() as number,
      classroomId,
      "teacher",
      undefined,
      auth.getUserId()
    );

    if (!classroomDetail || classroomDetail.count === 0) {
      throw new FlexibleError("Teacher is not part of classroom", 401);
    }

    // Parse CSV file
    const emails: string[] = [];
    const buffer = await file.arrayBuffer();
    const csvContent = Buffer.from(buffer).toString("utf-8");

    // Create a readable stream from the CSV content
    const readable = Readable.from([csvContent]);

    await new Promise<void>((resolve, reject) => {
      readable
        .pipe(csv())
        .on("data", (row) => {
          // Extract email from the first column or a column named 'email'
          const email =
            row.email || row.Email || row.EMAIL || Object.values(row)[0];
          if (email && typeof email === "string" && email.trim()) {
            emails.push(email.trim().toLowerCase());
          }
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(new FlexibleError(`CSV parsing error: ${error.message}`, 400));
        });
    });

    // Validate emails
    if (emails.length === 0) {
      throw new FlexibleError("No valid emails found in CSV file", 400);
    }

    if (emails.length > 500) {
      throw new FlexibleError(
        "Cannot add more than 500 students at a time",
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      throw new FlexibleError(
        `Invalid email format found: ${invalidEmails.slice(0, 5).join(", ")}${invalidEmails.length > 5 ? "..." : ""}`,
        400
      );
    }

    // Prepare data for bulk insert
    const userClassroomData: UserClassroomID = emails.map((email) => ({
      email,
      classroom_id: classroomId,
    }));

    // Use existing RPC function to insert users
    const failedInserts = await classroomDAO.insertUsers(userClassroomData);

    const data: CSVUploadResponse = {
      totalEmails: emails.length,
      successfulInserts: emails.length - failedInserts.length,
      failedInserts: failedInserts,
      failedCount: failedInserts.length,
    };

    return ResponseWrapper.success(
      `Successfully processed ${emails.length} emails. ${data.successfulInserts} students added, ${data.failedCount} failed.`,
      data
    );
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to upload and process CSV file",
      err?.status ?? 500,
      err?.message ?? ""
    );
  }
}
