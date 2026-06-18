import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";
import { TypeGuard } from "@/src/app/api/lib/utils/typeGuard";

export class PredictionProcessing {
  readonly current_scores: number[];
  readonly predictedCategories: number[];
  readonly predictedDifficulties: number[];
  filteredPredictedCategories: number[];
  filteredPredictedDifficulties: number[];

  constructor(
    current_scores: number[],
    predictedCategories: number[],
    predictedDifficulties: number[],
  ) {
    this.current_scores = current_scores;
    this.predictedCategories = predictedCategories;
    this.predictedDifficulties = predictedDifficulties;
  }

  fixPredictions() {
    this.filteredPredictedCategories = ArrayHelper.filterIndicesByValue(
      this.current_scores,
      this.predictedCategories,
    );

    // Add randomness: shuffle the filtered categories
    this.filteredPredictedCategories = ArrayHelper.shuffleArray(this.filteredPredictedCategories);

    while (this.filteredPredictedCategories.length != 5) {
      this.filteredPredictedCategories.push(
        ArrayHelper.getRandomNonZeroIndex(this.current_scores) as number,
      );
    }

    // Add more randomness: shuffle again after filling to 5
    this.filteredPredictedCategories = ArrayHelper.shuffleArray(this.filteredPredictedCategories);

    this.filteredPredictedCategories = ArrayHelper.incrementArray(
      this.filteredPredictedCategories,
    );

    // Add randomness to difficulties as well
    const shuffledDifficulties = ArrayHelper.shuffleArray([...this.predictedDifficulties]);
    this.filteredPredictedDifficulties = ArrayHelper.incrementArray(
      shuffledDifficulties,
    );

    return {
      trueCategories: this.filteredPredictedCategories,
      trueDifficulties: this.filteredPredictedDifficulties,
    };
  }
}
