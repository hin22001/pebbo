import {
  AnswerObject,
  NodeAttrs,
  TipTapNode,
  UserAnswers,
  UserQuizQuestion,
} from "@/src/app/api/lib/types/questionTypes";
import { FlexibleError } from "@/src/app/api/lib/utils/flexibleError";
import { QuizQuestionsResponse } from "@/src/app/api/lib/types/supabaseTypesOverride";

export class UserQuestionProcessing {
  static fixUnansweredQuestions(questions: UserQuizQuestion[]) {
    questions.forEach((element) => {
      if (!element.user_answers) {
        this.stackClearAnswersExplanations(element);
      }
    });
  }

  private static stackClearAnswersExplanations(question: UserQuizQuestion) {
    var initialObject = question.question_object;
    const stack: TipTapNode[] = [initialObject];

    while (stack.length > 0) {
      const current = stack.pop();

      if (current?.content) {
        for (const child of current.content) {
          stack.push(child);
        }
      }

      if (current?.attrs) {
        if (current.attrs.answer !== undefined) {
          current.attrs.answer = "";
        }
        if (current.attrs.answers !== undefined) {
          try {
            const answersArray = JSON.parse(current.attrs.answers);
            current.attrs.multiple = answersArray.length > 1;
            current.attrs.answers = "";
          } catch (error) {
            throw new FlexibleError("Error parsing answers", 500);
          }
        }
        if (current.attrs.explanation !== undefined) {
          current.attrs.explanation = "";
        }
      }
    }
  }

  static fixAnsweredQuestions(questions: UserQuizQuestion[]) {
    questions.forEach((element) => {
      if (element.user_answers) {
        this.markAnswers(element, element.user_answers);
      }
    });
  }

  private static markAnswers(
    question: UserQuizQuestion,
    user_answers: UserAnswers[],
  ) {
    const tiptapNode = question.question_object;
    const queue = [tiptapNode];

    let userAnswerCounter = 0;
    let totalAccuracy = 0;

    while (queue.length) {
      const current_tiptapNode = queue.shift();

      if (current_tiptapNode?.content) {
        //add to queue
        current_tiptapNode.content.forEach((nested_tiptapNode) =>
          queue.push(nested_tiptapNode),
        );
      } else if (current_tiptapNode?.attrs) {
        const current_tiptapNode_attrs = current_tiptapNode.attrs;

        const CounterAndAccuracy = this.branchAnswerType(
          current_tiptapNode_attrs,
          user_answers[userAnswerCounter],
        );

        userAnswerCounter += CounterAndAccuracy.incrementBy;
        totalAccuracy += CounterAndAccuracy.accuracy;
      }
    }

    if (!question.accuracy) {
      const accuracy = isNaN(totalAccuracy / userAnswerCounter)
        ? 0
        : totalAccuracy / userAnswerCounter;
      question.accuracy = accuracy;
    }
  }

  private static branchAnswerType(
    current_tiptapNode_attrs: NodeAttrs,
    user_answer: UserAnswers,
  ) {
    if (current_tiptapNode_attrs?.answer) {
      const results = this.checkAnswer(
        current_tiptapNode_attrs.answer,
        user_answer.answers,
        "answer",
      );

      current_tiptapNode_attrs.accuracy = results.accuracy;
      current_tiptapNode_attrs.isCorrect = results.isCorrect;
      current_tiptapNode_attrs.value = user_answer.answers[0];

      return {
        incrementBy: 1,
        accuracy: results.accuracy,
      };
    } else if (current_tiptapNode_attrs?.answers) {
      const results = this.checkAnswer(
        current_tiptapNode_attrs.answers,
        user_answer.answers,
        "answers",
      );

      current_tiptapNode_attrs.accuracy = results.accuracy;
      current_tiptapNode_attrs.isCorrect = results.isCorrect;
      current_tiptapNode_attrs.multiple = results.multiple as boolean;
      current_tiptapNode_attrs.value = user_answer.answers;

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

  private static checkAnswer(
    answerToParse: string,
    userAnswer: string[],
    type: "answer" | "answers",
  ) {
    const modelAnswers = JSON.parse(answerToParse);

    if (type === "answer") {
      if (userAnswer.length > 1)
        throw new FlexibleError("Too many answers", 400);

      const indexedAnswer = userAnswer[0];

      const accuracy =
        this.standardizeAnswer(modelAnswers) ==
        this.standardizeAnswer(indexedAnswer)
          ? 1.0
          : 0.0;
      const isCorrect = accuracy == 1.0 ? true : false;

      return {
        accuracy,
        isCorrect,
        multiple: null,
      };
    } else {
      // Filter for only checked answers (standard for draft questions)
      const filteredModelAnswers = modelAnswers.filter(
        (item: any) => item.checked === true || item.checked === undefined,
      );

      if (filteredModelAnswers.length != userAnswer.length) {
        return {
          accuracy: 0,
          isCorrect: false,
          multiple: filteredModelAnswers.length > 1 ? true : false,
        };
      }

      let correct = 0;
      // Re-assign for the loop below to use filtered version
      const finalModelAnswers = filteredModelAnswers;

      for (let j = 0; j < finalModelAnswers.length; j++) {
        if (
          this.standardizeAnswer(finalModelAnswers[j]?.label) ==
          this.standardizeAnswer(userAnswer[j])
        ) {
          correct++;
        }
      }

      const accuracy = correct / finalModelAnswers.length == 1.0 ? 1.0 : 0.0;
      const isCorrect = accuracy == 1.0 ? true : false;

      return {
        accuracy,
        isCorrect,
        multiple: modelAnswers.length > 1 ? true : false,
      };
    }
  }

  private static standardizeAnswer(answer: string): string {
    return answer.replace(/\s/g, "").toUpperCase();
  }

  static mergeSubmittedAnswersWithQuestions(
    quizQuestions: QuizQuestionsResponse[],
    all_answers: AnswerObject[],
  ) {
    quizQuestions.forEach((quiz) => {
      if (quiz.user_answers === null) {
        let answer = all_answers.find(
          (ans) => ans.question_id === quiz.question_id,
        );
        if (answer) {
          quiz.user_answers = answer.user_answers;
          if (quiz.time_taken === null) {
            quiz.time_taken = answer.time_taken;
          }
        }
      }
    });
  }

  static assignStudentId(
    quizQuestions: QuizQuestionsResponse[],
    user_id: string,
  ) {
    quizQuestions.forEach((quiz) => {
      if (!quiz.student_id) {
        quiz.student_id = user_id;
      }
    });
  }

  static formatForDB(quizQuestions: QuizQuestionsResponse[], user_id: string) {
    return quizQuestions
      .filter((quiz) => quiz.student_id === null)
      .map((quiz) => ({
        accuracy: quiz.accuracy as number,
        question_id: quiz.question_id,
        quiz_id: quiz.quiz_id,
        student_id: user_id,
        time_taken: quiz.time_taken as number,
        user_answers: quiz.user_answers as UserAnswers[],
      }));
  }
}
