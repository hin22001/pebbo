"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import ClassroomStudentQuiz from "@/app/components/templates/ClassroomStudentQuiz/ClassroomStudentQuiz";

export default function ClassroomStudentQuizClient() {
  const router = useRouter();
  const dispatch = useDispatch();

  const appRouter = {
    push: (url: string) => router.push(url),
  };

  const assignMainLayoutAction = (payload: any) =>
    dispatch(assignMainLayout(payload));

  return (
    <ClassroomStudentQuiz
      router={appRouter}
      assignMainLayout={assignMainLayoutAction}
    />
  );
}
