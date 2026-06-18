"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import UserQuestionsTeacher from "@/app/components/templates/UserQuestionsTeacher/UserQuestionsTeacher";

export default function UserQuestionsTeacherClient() {
  const dispatch = useDispatch();
  return (
    <UserQuestionsTeacher
      assignMainLayout={(payload: any) => dispatch(assignMainLayout(payload))}
    />
  );
}
