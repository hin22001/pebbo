"use client";

import React from "react";
import type { ComponentProps } from "react";
import QuestionPageLegacy from "./QuestionPage";
import { useQuestionCategories } from "./hooks/useQuestionCategories";
import { useQuestionResults } from "./hooks/useQuestionResults";
import { useExerciseEffects } from "./hooks/useExerciseEffects";

/**
 * Functional shell for the Question page.
 *
 * For now this is a thin wrapper around the existing class-based
 * `QuestionPage` component so we can:
 * - Introduce a function-component API and props type
 * - Start extracting hooks and smaller pieces without changing behaviour
 * - Gradually migrate logic out of the legacy class in small, safe steps
 */

export type QuestionPageV2Props = ComponentProps<typeof QuestionPageLegacy>;

export function QuestionPageV2(props: QuestionPageV2Props) {
  const { categoryValues, postCompleteQuestion, assignMainLayout, ...rest } =
    props as QuestionPageV2Props & {
      categoryValues?: Array<string | number> | null;
      postCompleteQuestion?: (params: unknown) => Promise<unknown>;
      assignMainLayout?: (payload: unknown) => void | Promise<void>;
    };

  const { selectedCategories, isCategorySelected, toggleCategory } =
    useQuestionCategories({
      initialSelected: categoryValues ?? undefined,
    });

  const effects = useExerciseEffects();

  const { handleSubmit } = useQuestionResults({
    postCompleteQuestion: postCompleteQuestion as Parameters<
      typeof useQuestionResults
    >[0]["postCompleteQuestion"],
    assignMainLayout: assignMainLayout as Parameters<
      typeof useQuestionResults
    >[0]["assignMainLayout"],
    onPlayAlertSound: effects.playAlertSound,
    onPlayResultSound: effects.playResultSound,
    onInvalidAnswer: (mainClassName) => {
      const allFields = document.querySelectorAll(
        `.${mainClassName}-question .active .rich-text-text-field-component, 
         .${mainClassName}-question .active .rich-text-dropdown-component,
         .${mainClassName}-question .active .rich-text-fraction-component`,
      );
      let targetField: Element | null = null;
      for (let i = 0; i < allFields.length; i++) {
        const field = allFields[i];
        let isEmpty = false;
        if (field.classList.contains("rich-text-text-field-component")) {
          const input = field.querySelector("input");
          isEmpty =
            !input || !input.value || (input.value as string).trim() === "";
        } else if (field.classList.contains("rich-text-dropdown-component")) {
          const select = field.querySelector("select");
          isEmpty = !select || !select.value || select.value === "";
        } else if (field.classList.contains("rich-text-fraction-component")) {
          const inputs = field.querySelectorAll("input");
          isEmpty =
            !inputs ||
            inputs.length === 0 ||
            Array.from(inputs).every(
              (input) => !input.value || (input.value as string).trim() === "",
            );
        }
        if (isEmpty) {
          targetField = field;
          break;
        }
      }
      if (!targetField && allFields.length > 0) targetField = allFields[0];
      if (targetField) {
        effects.animateIncompleteAnswer(targetField as HTMLElement);
      }
    },
  });

  return (
    <QuestionPageLegacy
      {...rest}
      categoryValues={categoryValues}
      selectedCategories={selectedCategories}
      isCategorySelected={isCategorySelected}
      onCategoryToggle={toggleCategory}
      postCompleteQuestion={postCompleteQuestion}
      assignMainLayout={assignMainLayout}
      onSubmitFromHook={handleSubmit}
      effects={effects}
    />
  );
}
