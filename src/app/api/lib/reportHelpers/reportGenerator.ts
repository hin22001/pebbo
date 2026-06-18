import { ReportCompletedQuestion } from "@/src/app/api/lib/types/questionTypes";
import {
  AverageAccuracy,
  AverageTimePerQuestion,
  DailyReport,
  Graph,
  GraphData,
  LearningProgressOverview,
  QuestionsCompleted,
  Strengths,
  TotalTime,
  Weaknesses,
  WeeklyReport,
} from "@/src/app/api/lib/types/reportTypes";
import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";
import { DateTime } from "@/src/app/api/lib/utils/dateTime";

type AvgOutSchema = {
  year: true;
  outer_category: true;
  inner_category: true;
  accuracy: true;
};

type AvgOut = {
  year: number;
  outer_category: number;
  inner_category: number;
  accuracy: number;
};

export class ReportGenerator {
  currentCompletedQuestions: ReportCompletedQuestion[];
  previousCompletedQuestions: ReportCompletedQuestion[];
  pastCompletedQuestions: ReportCompletedQuestion[];

  constructor(
    currentCompletedQuestions: ReportCompletedQuestion[],
    previousCompletedQuestions: ReportCompletedQuestion[],
    pastCompletedQuestions: ReportCompletedQuestion[],
  ) {
    this.currentCompletedQuestions = currentCompletedQuestions;
    this.previousCompletedQuestions = previousCompletedQuestions;
    this.pastCompletedQuestions = pastCompletedQuestions;
  }

  private getQuestionCounts() {
    return {
      currentQuestionCount: this.currentCompletedQuestions.length,
      previousQuestionCount: this.previousCompletedQuestions.length,
    };
  }

  generate_daily_report(): DailyReport {
    const learningProgressOverview = this.getLearningProgressOverview();
    const strengths = this.getStrengths();
    const weaknesses = this.getWeaknesses();

    const dailyReport: DailyReport = {
      learning_progress_overview: learningProgressOverview,
      strengths: strengths,
      weaknesses: weaknesses,
    };

    return dailyReport;
  }

  generate_weekly_report() {
    const learningProgressOverview = this.getLearningProgressOverview();
    const strengths = this.getStrengths();
    const weaknesses = this.getWeaknesses();
    const graph_data = this.getGraphData();

    const weeklyReport: WeeklyReport = {
      learning_progress_overview: learningProgressOverview,
      strengths: strengths,
      weaknesses: weaknesses,
      graph_data: graph_data,
    };

    return weeklyReport;
  }

  getGraphData(): GraphData {
    const main_array = [...this.currentCompletedQuestions];

    this.combineArrays(main_array, this.previousCompletedQuestions);
    this.combineArrays(main_array, this.pastCompletedQuestions);

    const { graph1Data, graph2Data, graph3Data } =
      this.processGraphData(main_array);

    const days = DateTime.DaysofWeek();
    const data1: Graph = {
      points: [],
    };
    const data2: Graph = {
      points: [],
    };
    const data3: Graph = {
      points: [],
    };

    days.forEach((day) => {
      data1.points.push(this.newArrayWithoutDuplicates(graph1Data[day]).length);
      data2.points.push(this.newArrayWithoutDuplicates(graph1Data[day]).length);
    });

    const difficulties = ["1", "2", "3", "4", "5"];
    difficulties.forEach((difficulty) => {
      data3.points.push(graph3Data[difficulty]);
    });

    const graph_data: GraphData = {
      knowledge_points: data1,
      learning_time: data2,
      performance: data3,
    };

    return graph_data;
  }

  private getLearningProgressOverview(): LearningProgressOverview {
    const questionsCompleted: QuestionsCompleted = this.getQuestionsCompleted();
    const averageAccuracy: AverageAccuracy = this.getAverageAccuracy();
    const totalTime: TotalTime = this.getTotalTime();
    const averageTimePerQuestion: AverageTimePerQuestion =
      this.getAverageTimePerQuestion();

    const learningProgressOverview: LearningProgressOverview = {
      questions_completed: questionsCompleted,
      average_accuracy: averageAccuracy,
      total_time: totalTime,
      average_time_per_question: averageTimePerQuestion,
    };

    return learningProgressOverview;
  }

  private getQuestionsCompleted(): QuestionsCompleted {
    const questionCount = this.getQuestionCounts();

    const questionsCompleted: QuestionsCompleted = {
      value: questionCount.currentQuestionCount,
      change:
        questionCount.currentQuestionCount -
        questionCount.previousQuestionCount,
    };

    return questionsCompleted;
  }

  private getAverageAccuracy(): AverageAccuracy {
    const questionCount = this.getQuestionCounts();

    const current_accuracy =
      (ArrayHelper.getSumByReducation(
        this.currentCompletedQuestions,
        "accuracy",
      ) /
        questionCount.currentQuestionCount) *
      100;
    let previous_accuracy =
      (ArrayHelper.getSumByReducation(
        this.previousCompletedQuestions,
        "accuracy",
      ) /
        questionCount.previousQuestionCount) *
      100;
    if (isNaN(previous_accuracy)) previous_accuracy = 0;

    const averageAccuracy: AverageAccuracy = {
      value: Math.round(current_accuracy),
      change: Math.round(current_accuracy - previous_accuracy),
    };

    return averageAccuracy;
  }

  private getTotalTime(): TotalTime {
    const current_total_time_s = ArrayHelper.getSumByReducation(
      this.currentCompletedQuestions,
      "time_taken",
    );
    const previous_total_time_s = ArrayHelper.getSumByReducation(
      this.previousCompletedQuestions,
      "time_taken",
    );

    const totalTime: TotalTime = {
      value: current_total_time_s,
      change: current_total_time_s - previous_total_time_s,
    };

    return totalTime;
  }

  private getAverageTimePerQuestion(): AverageTimePerQuestion {
    const questionCount = this.getQuestionCounts();

    const current_avg_time_s =
      ArrayHelper.getSumByReducation(
        this.currentCompletedQuestions,
        "time_taken",
      ) / questionCount.currentQuestionCount;
    let previous_avg_time_s =
      ArrayHelper.getSumByReducation(
        this.previousCompletedQuestions,
        "time_taken",
      ) / questionCount.previousQuestionCount;
    if (isNaN(previous_avg_time_s)) previous_avg_time_s = 0.0;

    const averageTimePerQuestion: AverageTimePerQuestion = {
      value: Math.floor(current_avg_time_s),
      change: Math.floor(current_avg_time_s) - Math.floor(previous_avg_time_s),
    };

    return averageTimePerQuestion;
  }

  getStrengths(): Strengths {
    const significantlyImprovedIn: string[] = this.getSignificantlyImprovedIn();
    const steadyGrowthIn: string[] = this.getSteadyGrowthIn();

    const strengths: Strengths = {
      significantly_improved_in: significantlyImprovedIn,
      steady_growth_in: steadyGrowthIn,
    };

    return strengths;
  }

  getSignificantlyImprovedIn(): string[] {
    const avgOutSchema: AvgOutSchema = {
      year: true,
      outer_category: true,
      inner_category: true,
      accuracy: true,
    };

    const current_filtered = this.transformToSchema<AvgOut>(
      this.currentCompletedQuestions,
      avgOutSchema,
    );
    const previous_filtered = this.transformToSchema<AvgOut>(
      this.previousCompletedQuestions,
      avgOutSchema,
    );
    const averaged_current = this.averageOut<AvgOut>(
      current_filtered,
      "accuracy",
    );

    let improvedAreas: AvgOut[] = [];

    if (!previous_filtered.length) {
      const median = this.findMedian(averaged_current, "accuracy");
      const max = this.findMax(averaged_current, "accuracy");
      const min_time = this.findMin(averaged_current, "time_taken");
      improvedAreas.push(median);
      improvedAreas.push(max);
      improvedAreas.push(min_time);
    } else {
      const averaged_previous = this.averageOut<AvgOut>(
        previous_filtered,
        "accuracy",
      );
      const diff_ = this.subtractAveragedOut(
        averaged_current,
        averaged_previous,
        "accuracy",
      );
      const max = this.findMax(diff_, "accuracy");
      const median = this.findMedian(averaged_current, "accuracy");
      const min_time = this.findMin(averaged_current, "time_taken");
      improvedAreas.push(median);
      improvedAreas.push(max);
      improvedAreas.push(min_time);
    }

    const uniqueImprovedAreas = this.removeAverageOutDuplicates(improvedAreas);

    return this.averageOutStringArray(uniqueImprovedAreas);
  }

  getSteadyGrowthIn(): string[] {
    const avgOutSchema: AvgOutSchema = {
      year: true,
      outer_category: true,
      inner_category: true,
      accuracy: true,
    };

    const current_filtered = this.transformToSchema<AvgOut>(
      this.currentCompletedQuestions,
      avgOutSchema,
    );
    const averaged_current = this.averageOut<AvgOut>(
      current_filtered,
      "time_taken",
    );
    const median_time = this.findMedian(averaged_current, "time_taken");

    return this.averageOutStringArray([median_time]);
  }

  getWeaknesses(): Weaknesses {
    const mostMistakesIn: string[] = this.getMostMistakesIn();
    const weaknesses: Weaknesses = {
      most_mistakes_in: mostMistakesIn,
    };

    return weaknesses;
  }

  getMostMistakesIn(): string[] {
    const avgOutSchema: AvgOutSchema = {
      year: true,
      outer_category: true,
      inner_category: true,
      accuracy: true,
    };

    const current_filtered = this.transformToSchema<AvgOut>(
      this.currentCompletedQuestions,
      avgOutSchema,
    );
    const averaged_current = this.averageOut<AvgOut>(
      current_filtered,
      "accuracy",
    );
    const min = this.findMin(averaged_current, "accuracy");

    return this.averageOutStringArray([min]);
  }

  transformToSchema<T>(array: ReportCompletedQuestion[], schema) {
    return array.map((item) => {
      const transformedItem = {} as T;
      for (const key of Object.keys(schema)) {
        transformedItem[key] = item[key];
      }
      return transformedItem;
    });
  }

  newArrayWithoutDuplicates(array: any[]) {
    return [...new Set(array)];
  }

  averageOut<T>(array: AvgOut[], key: string) {
    // Object to keep track of the sum and count for averaging
    const sumCountMap = {};

    // First pass: Sum values and count occurrences for each category combination
    array.forEach((item) => {
      const categoryKey = `${item.year}-${item.outer_category}-${item.inner_category}`;
      if (!sumCountMap[categoryKey]) {
        sumCountMap[categoryKey] = { sum: 0, count: 0 };
      }
      sumCountMap[categoryKey].sum += item[key];
      sumCountMap[categoryKey].count += 1;
    });

    // Second pass: Calculate the average for each category combination
    const result = array.map((item) => {
      const categoryKey = `${item.year}-${item.outer_category}-${item.inner_category}`;
      return {
        ...item,
        [key]: sumCountMap[categoryKey].sum / sumCountMap[categoryKey].count,
      };
    });

    // Create a unique array based on the category combinations
    const unique = Array.from(
      new Map(
        result.map((item) => [
          `${item.year}-${item.outer_category}-${item.inner_category}`,
          item,
        ]),
      ).values(),
    );

    return unique as T[];
  }

  findMedian<T>(array: T[], key: string): T {
    const sortedData = array.slice().sort((a, b) => a[key] - b[key]);

    const middleIndex = Math.floor(sortedData.length / 2);

    if (sortedData.length % 2 !== 0) {
      // If the length is odd, return the middle element
      return sortedData[middleIndex];
    } else {
      // If the length is even, return the lower of the two middle elements
      return sortedData[middleIndex - 1];
    }
  }

  findMax<T>(array: T[], key: string): T {
    return array.reduce((maxItem, currentItem) => {
      return currentItem[key] > maxItem[key] ? currentItem : maxItem;
    });
  }

  findMin<T>(array: T[], key: string): T {
    return array.reduce((minItem, currentItem) => {
      return currentItem[key] < minItem[key] ? currentItem : minItem;
    });
  }

  subtractAveragedOut(array1: AvgOut[], array2: AvgOut[], key: string) {
    // Create a map for easy lookup by concatenating outer_category and inner_category with the specified key
    const mapArray2 = new Map<string, number>(
      array2.map((item) => [
        `${item.year}-${item.outer_category}-${item.inner_category}`,
        item[key],
      ]),
    );

    // Subtract values for corresponding outer_category and inner_category pairs
    return array1.map((item) => {
      const itemKey = `${item.year}-${item.outer_category}-${item.inner_category}`;
      const value2 = mapArray2.get(itemKey) || 0; // Default to 0 if not found
      return {
        ...item,
        [key]: (item[key] || 0) - value2, // Use the key parameter to dynamically set the property
      };
    }) as AvgOut[];
  }

  removeAverageOutDuplicates(improvedAreas: AvgOut[]): AvgOut[] {
    const uniqueMap = new Map<string, AvgOut>();

    improvedAreas.forEach((item) => {
      const key = `${item.year}-${item.outer_category}-${item.inner_category}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    return Array.from(uniqueMap.values());
  }

  averageOutStringArray(uniqueImprovedAreas: AvgOut[]): string[] {
    return uniqueImprovedAreas.map(
      (item) => `${item.year}.${item.outer_category}.${item.inner_category}`,
    );
  }

  combineArrays(main, sub_array) {
    main.push(...sub_array);
  }

  processGraphData(data: ReportCompletedQuestion[]) {
    const graph1Data = {
      Monday: [] as any,
      Tuesday: [] as any,
      Wednesday: [] as any,
      Thursday: [] as any,
      Friday: [] as any,
      Saturday: [] as any,
      Sunday: [] as any,
    };
    const graph2Data = {
      Monday: [] as any,
      Tuesday: [] as any,
      Wednesday: [] as any,
      Thursday: [] as any,
      Friday: [] as any,
      Saturday: [] as any,
      Sunday: [] as any,
    };
    const difficultyCount = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };

    data.forEach((item) => {
      const dayOfWeek = DateTime.getDayOfWeek(item.date);
      const knowledgePoints = `${item.year}.${item.outer_category}.${item.inner_category}`;
      const timeTakenFormatted = item.time_taken;

      // Graph 1: Day vs Knowledge Points
      if (!graph1Data[dayOfWeek]) {
        graph1Data[dayOfWeek] = [];
      }
      graph1Data[dayOfWeek].push(knowledgePoints);

      // Graph 2: Day vs time_taken (minutes:seconds)
      if (!graph2Data[dayOfWeek]) {
        graph2Data[dayOfWeek] = [];
      }
      graph2Data[dayOfWeek].push(timeTakenFormatted);

      // Graph 3: Difficulty vs Number of questions
      difficultyCount[item.difficulty] =
        (difficultyCount[item.difficulty] || 0) + 1;
    });

    const graph3Data = difficultyCount;

    return { graph1Data, graph2Data, graph3Data };
  }
}
