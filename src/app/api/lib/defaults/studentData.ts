import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export class DefaultStudentData {
  private static scoreUpperLimit = 0.4;
  private static scoreLowerLimit = 0.08;

  private static score_lengths = {
    primary: {
      1: 16,
      2: 19,
      3: 15,
      4: 15,
      5: 14,
      6: 15,
    },
  };

  static getLength(education_level: string, year: string): number {
    return this.score_lengths[education_level][year];
  }

  static getInitialScores(education_level: string, year: string): number[] {
    const length = this.getLength(education_level, year);
    return ArrayHelper.getDecreasingArray(
      length,
      this.scoreUpperLimit,
      this.scoreLowerLimit,
    );
  }

  static getInitialEnabledCategories(
    education_level: string,
    year: string,
  ): number[] {
    const length = this.getLength(education_level, year);
    return ArrayHelper.getLinearArray(length, 1);
  }

  static assertContext(education_level: string, year: string) {
    if (education_level === "primary") {
      if (parseInt(year) < 1 || parseInt(year) > 6) {
        throw new FlexibleError("Invalid range", 400);
      }
    } else {
      throw new FlexibleError("Invalid education level", 400);
    }
  }
}
