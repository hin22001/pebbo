import { useEffect } from "react";

type QuestionId = string | number;

export type UseQuestionFlowOptions = {
  activeTab: QuestionId | null | undefined;
  tabs: Array<{ id: QuestionId }> | null | undefined;
  /**
   * Invoked when the flow decides that a different tab should become active.
   * The parent is still the ultimate source of truth for `activeTab`.
   */
  onSwitchTab?: (nextId: QuestionId) => void;
  /**
   * Optional handlers used for keyboard / wheel navigation. These typically
   * forward into the legacy `handleEvent` implementation.
   */
  onNextQuestion?: () => void;
  onPreviousQuestion?: () => void;
};

/**
 * Encapsulates navigation-related side effects for the question flow:
 * - Persists the current active tab id into localStorage.
 * - Restores the last active tab on mount (if possible).
 * - Wires up basic keyboard shortcuts to move between questions.
 *
 * The actual `activeTab` value is still owned by the caller, so this hook
 * can be adopted without changing the underlying class component state yet.
 */
export function useQuestionFlow(options: UseQuestionFlowOptions) {
  const { activeTab, tabs, onSwitchTab, onNextQuestion, onPreviousQuestion } =
    options;

  // Restore last active tab on mount
  useEffect(() => {
    if (!onSwitchTab || !tabs || !tabs.length) return;

    const stored = window.localStorage.getItem("activeTab");
    if (!stored) return;

    const parsed = Number.isNaN(Number(stored)) ? stored : Number(stored);
    const exists = tabs.some((t) => String(t.id) === String(parsed));
    if (!exists) return;

    if (
      activeTab == null ||
      String(activeTab) !== String(parsed)
    ) {
      onSwitchTab(parsed);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep localStorage in sync with the current active tab
  useEffect(() => {
    if (activeTab == null) return;
    try {
      window.localStorage.setItem("activeTab", String(activeTab));
    } catch {
      // best-effort only
    }
  }, [activeTab]);

  // Keyboard navigation (Left/Right arrows)
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Avoid hijacking shortcuts inside inputs or editable elements
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      const isTypingElement =
        tag === "input" ||
        tag === "textarea" ||
        (target as any).isContentEditable;
      if (isTypingElement) return;

      if (event.key === "ArrowRight") {
        if (onNextQuestion) {
          event.preventDefault();
          onNextQuestion();
        }
      } else if (event.key === "ArrowLeft") {
        if (onPreviousQuestion) {
          event.preventDefault();
          onPreviousQuestion();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onNextQuestion, onPreviousQuestion]);
}

