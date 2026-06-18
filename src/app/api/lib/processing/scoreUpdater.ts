import { DBCompletedQuestion } from "@/src/app/api/lib/types/questionTypes";
import { CorrelationMatrix } from "@/src/app/api/lib/types/scoreUpdaterTypes";

export class ScoreUpdater {
  name: string;
  correlation_matrix: number[][];
  correctThreshold: number;

  constructor(c_matrix: number[][]) {
    this.correlation_matrix = c_matrix;
    this.correctThreshold = 0.5;
  }

  updateScore(
    DBCompletedQuestions: DBCompletedQuestion[],
    current_score: number[],
  ) {
    DBCompletedQuestions.forEach((DBCompletedQuestion) => {
      // this.addInfo(question_completed);
      const category = DBCompletedQuestion.outer_category;
      const difficulty = DBCompletedQuestion.difficulty;
      const accuracy = DBCompletedQuestion.accuracy;
      const correlation = this.correlation_matrix[category - 1];

      for (let i = 0; i < correlation.length; i++) {
        const raw_correlation_value = correlation[i];
        const difficulty_value = difficulty / 10;
        // const correct = accuracy > this.correct_threshold ? 1.0 : -1.0

        current_score[i] = this.calculate_new_score(
          current_score[i],
          accuracy,
          raw_correlation_value,
          difficulty_value,
        );
        current_score[i] = parseFloat(current_score[i].toFixed(2));
      }
    });
    if (Math.random() > 0.4) {
      this.shuffleArray(current_score);
    }
  }

  calculate_new_score(
    user_score: number,
    accuracy: number,
    raw_correlation_value: number,
    difficulty_value: number,
  ) {
    let _correct = accuracy > this.correctThreshold ? 1.0 : -1.0;
    if (_correct > 0) {
      _correct = Math.random() > 0.5 ? -1.0 : 1.0;
    }
    const score_addition =
      (raw_correlation_value + accuracy) * (1.0 + difficulty_value);
    const new_score =
      user_score + _correct * this.normalize_score(score_addition);
    return this.clampScore(new_score);
  }

  normalize_score(score: number): number {
    //strip whole number
    const normalized = Math.abs(score % 1);
    //scale between 0.1-0.3
    return 0.1 + normalized * 0.2;
  }

  clampScore(score: number): number {
    return Math.max(0.05, Math.min(score, 0.9));
  }

  shuffleArray(scores: number[]): void {
    for (let i = scores.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [scores[i], scores[j]] = [scores[j], scores[i]];
    }
  }
}
