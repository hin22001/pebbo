"use client";

import React from "react";
import QuizExercise from "@/templates/QuizExercise/QuizExercise";
import TeacherCard from "@/modules/card/TeacherCard";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";

export default function QuizExerciseClient() {
  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <QuizExercise />
      </TeacherCard>
    </ContentLayout>
  );
}
