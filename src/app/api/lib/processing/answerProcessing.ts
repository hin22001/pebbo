import {
  Questions,
  DBCompletedQuestion,
  Question,
  AnswerObject,
  TipTapNode,
  NodeAttrs,
  UserAnswers,
} from "@/src/app/api/lib/types/questionTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";

export class AnswerProcessing {
  userCompletedAnswers: AnswerObject[];
  questions: Questions;
  readonly user_id: string;

  DBCompletedQuestions: DBCompletedQuestion[] = [];

  constructor(
    user_id: string,
    userCompletedAnswers: AnswerObject[],
    questions: Questions,
  ) {
    this.user_id = user_id;
    this.userCompletedAnswers = userCompletedAnswers;
    this.questions = questions;

    // this.reorderArraysInAscendingOrder()
  }

  getDBCompletedQuestions() {
    return this.DBCompletedQuestions;
  }

  private reorderArraysInAscendingOrder(): void {
    this.questions.sort((a, b) => a.id - b.id);
    this.userCompletedAnswers.sort((a, b) => a.question_id - b.question_id);
  }

  private ensureMatchingQuestionIds() {
    const validQuestionIds = new Set(this.questions.map((q) => q.id));

    for (const answerObject of this.userCompletedAnswers) {
      if (!validQuestionIds.has(answerObject.question_id)) {
        throw new FlexibleError("Question IDs not matching", 400);
      }
    }
  }

  standardizeAnswer(answer: any): string {
    // Handle different data types
    if (typeof answer === "string") {
      return answer.replace(/\s/g, "").toUpperCase();
    } else if (typeof answer === "number") {
      return answer.toString().replace(/\s/g, "").toUpperCase();
    } else if (Array.isArray(answer)) {
      // If it's an array, join the elements and standardize
      return answer.map((item) => this.standardizeAnswer(item)).join(",");
    } else if (answer && typeof answer === "object") {
      // If it's an object, try to get a meaningful string representation
      if (answer.label !== undefined) {
        return this.standardizeAnswer(answer.label);
      } else if (answer.text !== undefined) {
        return this.standardizeAnswer(answer.text);
      } else {
        return JSON.stringify(answer).replace(/\s/g, "").toUpperCase();
      }
    } else {
      // Fallback for any other type
      return String(answer || "")
        .replace(/\s/g, "")
        .toUpperCase();
    }
  }

  findAndCheckAnswers() {
    // this.ensureMatchingQuestionIds();

    for (let i = 0; i < this.questions.length; i++) {
      const DBCompletedQuestion: DBCompletedQuestion =
        this.initDBCompletedQuestion(
          this.questions[i],
          this.userCompletedAnswers[i].time_taken,
        );

      const accuracy = this.deepSearchQuestion(
        this.questions[i],
        this.userCompletedAnswers[i],
      );
      DBCompletedQuestion.accuracy = accuracy;

      this.DBCompletedQuestions.push(DBCompletedQuestion);
    }
  }

  private initDBCompletedQuestion(question: Question, time_taken: number) {
    return {
      user_id: this.user_id,
      question_id: question.id,
      outer_category: question.outer_category,
      difficulty: question.difficulty,
      accuracy: 0,
      time_taken: time_taken,
    } as DBCompletedQuestion;
  }

  private deepSearchQuestion(
    question: Question,
    userAnsweringData: AnswerObject,
  ) {
    const tiptapNode = question.question_object as TipTapNode;
    const queue = [tiptapNode];

    let userAnswerCounter = 0;
    let totalAccuracy = 0;

    while (queue.length) {
      const current_tiptapNode = queue.shift();

      if (current_tiptapNode?.content) {
        current_tiptapNode.content.forEach((nested_tiptapNode) =>
          queue.push(nested_tiptapNode),
        );
      } else if (current_tiptapNode?.attrs) {
        const current_tiptapNode_attrs = current_tiptapNode.attrs;

        const CounterAndAccuracy = this.branchAnswerType(
          current_tiptapNode_attrs,
          userAnsweringData.user_answers[userAnswerCounter],
        );

        userAnswerCounter += CounterAndAccuracy.incrementBy;
        totalAccuracy += CounterAndAccuracy.accuracy;
      }
    }

    const accuracy = isNaN(totalAccuracy / userAnswerCounter)
      ? 0
      : totalAccuracy / userAnswerCounter;

    question.accuracy = accuracy;

    return accuracy;
  }

  private branchAnswerType(
    current_tiptapNode_attrs: NodeAttrs,
    userAnswers: UserAnswers,
  ) {
    if (current_tiptapNode_attrs?.answer) {
      const results = this.checkAnswer(
        current_tiptapNode_attrs.answer,
        userAnswers?.answers,
        "answer",
      );

      current_tiptapNode_attrs.accuracy = results.accuracy;
      current_tiptapNode_attrs.isCorrect = results.isCorrect;

      return {
        incrementBy: 1,
        accuracy: results.accuracy,
      };
    } else if (current_tiptapNode_attrs?.answers) {
      const results = this.checkAnswer(
        current_tiptapNode_attrs.answers,
        userAnswers?.answers,
        "answers",
      );

      current_tiptapNode_attrs.accuracy = results.accuracy;
      current_tiptapNode_attrs.isCorrect = results.isCorrect;
      current_tiptapNode_attrs.multiple = results.multiple as boolean;

      return {
        incrementBy: 1,
        accuracy: results.accuracy,
      };
    } else {
      return {
        incrementBy: 0,
        accuracy: 0,
      };
    }
  }

  private checkAnswer(
    answerToParse: string,
    userAnswer: string[] | undefined,
    type: "answer" | "answers",
  ) {
    // Debug logging for answer processing
    console.log(`[DEBUG] Processing answer:`, {
      type,
      answerToParse,
      answerToParseType: typeof answerToParse,
      userAnswer,
      userAnswerType: typeof userAnswer,
      userAnswerLength: userAnswer?.length,
    });

    let modelAnswers;
    try {
      // Validate answerToParse
      if (!answerToParse || typeof answerToParse !== "string") {
        throw new Error(
          `Invalid answerToParse: ${answerToParse} (type: ${typeof answerToParse})`,
        );
      }

      // Normalise legacy mixed-fraction encodings like "10\\frac{null}{null}"
      // to behave as plain whole-number answers ("10").
      const cleanedAnswerToParse = answerToParse.replace(
        /\\frac\{null\}\{null\}/g,
        "",
      );

      modelAnswers = JSON.parse(cleanedAnswerToParse);

      // Ensure modelAnswers is always an array
      // For open-input questions, the answer is stored as a JSON string (e.g., "\"427\"")
      // After parsing, it becomes a string (e.g., "427")
      // We need to wrap it in an array for consistent processing
      if (!Array.isArray(modelAnswers)) {
        modelAnswers = [modelAnswers];
      }
    } catch (parseError) {
      console.error(`[ERROR] Failed to parse answerToParse:`, {
        answerToParse,
        error: parseError.message,
        type: typeof answerToParse,
      });
      throw new Error(`Invalid answer format: ${parseError.message}`);
    }

    // Only count checked answers as correct (filter out unchecked options for draft questions)
    const checkedAnswers = modelAnswers.filter(
      (item: any) => item.checked === true || item.checked === undefined,
    );

    const isMutltipleAnswers = checkedAnswers.length > 1 ? true : false;

    console.log(`[DEBUG] Successfully parsed modelAnswers:`, {
      modelAnswers,
      checkedAnswers,
      modelAnswersType: typeof modelAnswers,
      isArray: Array.isArray(modelAnswers),
      length: modelAnswers.length,
      checkedLength: checkedAnswers.length,
    });

    if (!userAnswer) {
      return {
        accuracy: 0,
        isCorrect: false,
        multiple: isMutltipleAnswers,
      };
    }

    // Validate user answer format
    if (!Array.isArray(userAnswer)) {
      console.error(`[ERROR] userAnswer is not an array:`, {
        userAnswer,
        type: typeof userAnswer,
        expectedType: "array",
      });
      throw new Error(
        `Invalid user answer format: expected array, got ${typeof userAnswer}`,
      );
    }

    if (type === "answer") {
      if (userAnswer?.length > 1)
        throw new FlexibleError("Too many answers", 400);

      const indexedAnswer = userAnswer[0];

      // Validate answer content
      if (indexedAnswer === undefined || indexedAnswer === null) {
        console.error(`[ERROR] Empty answer provided:`, {
          userAnswer,
          indexedAnswer,
          type: typeof indexedAnswer,
        });
        return {
          accuracy: 0,
          isCorrect: false,
          multiple: false,
        };
      }

      console.log(`[DEBUG] Comparing answers:`, {
        modelAnswer: modelAnswers[0],
        userAnswer: indexedAnswer,
        modelAnswerType: typeof modelAnswers[0],
        userAnswerType: typeof indexedAnswer,
      });

      const accuracy =
        this.standardizeAnswer(modelAnswers[0]) ==
        this.standardizeAnswer(indexedAnswer)
          ? 1.0
          : 0.0;
      const isCorrect = accuracy == 1.0 ? true : false;

      return {
        accuracy,
        isCorrect,
        multiple: false,
      };
    } else {
      //type is "answers" --> meaning multiple choice / dropdown
      // Use checkedAnswers (only correct options) for comparison, NOT all modelAnswers
      // modelAnswers contains all options (e.g. 4 dropdown options)
      // userAnswer only contains the selected option(s) (e.g. 1 item)
      if (checkedAnswers.length != userAnswer.length) {
        console.log(`[DEBUG] Answer length mismatch:`, {
          checkedAnswersLength: checkedAnswers.length,
          userAnswerLength: userAnswer.length,
          checkedAnswers,
          userAnswer,
        });
        return {
          accuracy: 0,
          isCorrect: false,
          multiple: isMutltipleAnswers,
        };
      }

      let correct = 0;

      for (let j = 0; j < checkedAnswers.length; j++) {
        const modelAnswer = checkedAnswers[j]?.label || checkedAnswers[j];
        const userAnswerItem = userAnswer[j];

        console.log(`[DEBUG] Comparing multiple choice answers [${j}]:`, {
          modelAnswer,
          userAnswerItem,
          modelAnswerType: typeof modelAnswer,
          userAnswerType: typeof userAnswerItem,
        });

        if (
          this.standardizeAnswer(modelAnswer) ==
          this.standardizeAnswer(userAnswerItem)
        ) {
          correct++;
        }
      }

      const accuracy = correct / checkedAnswers.length == 1.0 ? 1.0 : 0.0;
      const isCorrect = accuracy == 1.0 ? true : false;

      return {
        accuracy,
        isCorrect,
        multiple: isMutltipleAnswers,
      };
    }
  }
}
