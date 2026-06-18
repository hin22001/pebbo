export type AskQuestion = {
  question_id: number;
  question: string;
  region: "en" | "zh";
};

export type QuestionChatMetaData = {
  type: "exerciseQuestion";
  question_id: number;
};

export type QuestionChatHistory = {
  user_id: string;
  role: "user" | "assistant";
  message: string;
  metadata: QuestionChatMetaData;
};
