import { SystemAdmin } from "@/src/app/api/lib/utils/systemAdmin";

export class ModelDirectory {
  private static bucketPath: string =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/torchModels`;
  private static headers = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SystemAdmin.getSupabaseServiceKey()}`,
    },
  };

  static getPredictorModelPath(education_level: string, year: string): string {
    return `${this.bucketPath}/${education_level}/${year}/predictor.onnx`;
  }

  static getHeaders() {
    return this.headers;
  }
}
