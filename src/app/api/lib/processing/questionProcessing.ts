import {
  Questions,
  Question,
  TipTapNode,
} from "@/src/app/api/lib/types/questionTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { ArrayHelper } from "@/src/app/api/lib/utils/arrayHelper";

export class QuestionProcessing {
  readonly originalQuestions: Questions;
  newQuestions: Questions;

  constructor(questions: Questions) {
    this.originalQuestions = questions;
  }

  fixQuestions() {
    this.removeDuplicates();

    // Add randomness: shuffle questions after removing duplicates
    this.newQuestions = ArrayHelper.shuffleArray(this.newQuestions);
    if (this.newQuestions.length > 5) {
      this.newQuestions = ArrayHelper.shuffleArray(this.newQuestions).slice(
        0,
        5,
      );
    }

    this.newQuestions.forEach((element) => {
      this.stackClearAnswersExplanations(element, element.image_approved);
    });

    return this.newQuestions;
  }

  getQuestionIDs() {
    const questionIDs: number[] = [];
    for (const question of this.newQuestions) {
      questionIDs.push(question.id);
    }
    return questionIDs;
  }

  private removeDuplicates() {
    const uniqueQuestions: Question[] = [];
    const seenIds: Set<number> = new Set();

    for (const question of this.originalQuestions) {
      if (!seenIds.has(question.id)) {
        seenIds.add(question.id);
        uniqueQuestions.push(question);
      }
    }

    this.newQuestions = uniqueQuestions;
  }

  private stackClearAnswersExplanations(
    questionObject: Question,
    image_approved?: boolean,
  ) {
    var initialObject = questionObject.question_object as TipTapNode;
    const stack: TipTapNode[] = [initialObject];

    while (stack.length > 0) {
      const current = stack.pop();

      if (current?.content) {
        for (const child of current.content) {
          stack.push(child);
        }
      }

      if (current?.attrs) {
        // Inject image_approved status into SVG component nodes
        if (current.type === "SvgReactComponent") {
          // Prefer any existing image_approved flag from the JSON (e.g. when
          // coming directly from the DB), but fall back to the question-level
          // image_approved boolean. This prevents us from overwriting a
          // truthy value with false when image_approved is undefined.
          const existingFlag = current.attrs.image_approved;
          const effectiveApproved =
            existingFlag !== undefined ? existingFlag : image_approved;
          current.attrs.image_approved = !!effectiveApproved;
        }

        if (current.attrs.answer !== undefined) {
          current.attrs.answer = "";
        }
        if (current.attrs.answers !== undefined) {
          try {
            let answersArray;

            // Check if answers is already parsed or is a string
            if (typeof current.attrs.answers === "string") {
              // Only parse if it's a non-empty string
              if (current.attrs.answers.trim() === "") {
                answersArray = [];
              } else {
                answersArray = JSON.parse(current.attrs.answers);
              }
            } else if (Array.isArray(current.attrs.answers)) {
              answersArray = current.attrs.answers;
            } else {
              answersArray = [];
            }

            // Only check for answers that are checked true (or undefined for legacy)
            const checkedAnswers = answersArray.filter(
              (item: any) =>
                item.checked === true || item.checked === undefined,
            );
            current.attrs.multiple = checkedAnswers.length > 1;
            current.attrs.answers = "";
          } catch (error) {
            console.error("[ERROR] Failed to parse answers:", {
              answers: current.attrs.answers,
              type: typeof current.attrs.answers,
              error: error.message,
            });
            // Don't throw - just set to empty and continue
            current.attrs.multiple = false;
            current.attrs.answers = "";
          }
        }
        if (current.attrs.explanation !== undefined) {
          current.attrs.explanation = "";
        }
      }
    }
  }
}
