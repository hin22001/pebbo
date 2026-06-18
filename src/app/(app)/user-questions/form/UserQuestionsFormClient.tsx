"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import UserQuestionsForm from "@/app/components/templates/UserQuestionsForm/UserQuestionsForm";

export default function UserQuestionsFormClient() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("question_id") ?? undefined;
  return (
    <UserQuestionsForm
      questionId={questionId}
      assignMainLayout={(payload: any) => dispatch(assignMainLayout(payload))}
    />
  );
}
