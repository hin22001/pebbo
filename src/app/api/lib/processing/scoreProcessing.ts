import { DBCompletedQuestion } from "@/src/app/api/lib/types/questionTypes";
import CorrelationMatrix from "@/src/app/api/lib/data/correlationMatrix";
import { ScoreUpdater } from "@/src/app/api/lib/processing/scoreUpdater";

export class ScoreProcessing {
  matrix: number[][];
  currentScore: number[];
  DBCompletedQuestions: DBCompletedQuestion[];

  constructor(
    education_level: string,
    year: string,
    currentScore: number[],
    DBCompletedQuestions: DBCompletedQuestion[],
  ) {
    this.matrix = CorrelationMatrix[education_level][year];
    this.currentScore = currentScore;
    this.DBCompletedQuestions = DBCompletedQuestions;
  }

  updateScore() {
    const updater = new ScoreUpdater(this.matrix);

    updater.updateScore(this.DBCompletedQuestions, this.currentScore);
  }
}
