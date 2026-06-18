import { useEffect, useState } from "react";

type CategoryId = string | number;

export type UseQuestionCategoriesOptions = {
  /**
   * Category ids that should be selected on first render.
   * Mirrors `categoryValues` from the legacy QuestionPage.
   */
  initialSelected?: CategoryId[] | null | undefined;
};

export type UseQuestionCategoriesResult = {
  selectedCategories: CategoryId[];
  isCategorySelected: (value: CategoryId) => boolean;
  toggleCategory: (value: CategoryId) => void;
  setSelectedCategories: (next: CategoryId[]) => void;
};

/**
 * Encapsulates the category selection state and helpers that used to live
 * directly inside the QuestionPage class component.
 *
 * This hook is intentionally simple and side‑effect free so it can be reused
 * by the eventual functional QuestionPageV2 without changing behaviour.
 */
export function useQuestionCategories(
  options: UseQuestionCategoriesOptions = {},
): UseQuestionCategoriesResult {
  const { initialSelected } = options;

  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>(
    initialSelected ? [...initialSelected] : [],
  );

  // Keep state in sync if the caller updates the initial selection
  useEffect(() => {
    if (initialSelected) {
      setSelectedCategories([...initialSelected]);
    }
  }, [initialSelected?.join(",")]);

  const isCategorySelected = (value: CategoryId) =>
    selectedCategories.some((val) => String(val) === String(value));

  const toggleCategory = (value: CategoryId) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((val) => String(val) === String(value));
      if (exists) {
        return prev.filter((val) => String(val) !== String(value));
      }
      return [...prev, value];
    });
  };

  return {
    selectedCategories,
    isCategorySelected,
    toggleCategory,
    setSelectedCategories,
  };
}

