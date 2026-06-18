import { ResponseWrapper } from "@/src/app/api/lib/utils/repsonseWrapper";
import { CSVUploadTemplate } from "@/src/app/api/lib/types/classroomTypes";

export async function GET(req: Request) {
  try {
    // Create CSV template content
    const csvTemplate =
      "email\nstudent1@example.com\nstudent2@example.com\nstudent3@example.com";

    const data: CSVUploadTemplate = {
      template: csvTemplate,
      instructions: {
        format: "CSV file with email addresses",
        requiredColumn: "email (first column)",
        maxRows: 500,
        maxFileSize: "5MB",
        supportedFormats: ["CSV"],
        example: [
          "email",
          "john.doe@school.edu",
          "jane.smith@school.edu",
          "bob.wilson@school.edu",
        ],
      },
    };

    return ResponseWrapper.success("CSV upload template retrieved", data);
  } catch (err) {
    return ResponseWrapper.error(
      "Failed to get CSV template",
      500,
      err?.message ?? ""
    );
  }
}
