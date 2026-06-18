"use client";

import React from "react";
import { ClassroomAddQuiz } from "@/src/app/components";
import { ContentLayout } from "@/src/app/components/layouts/ContentLayout";
import { StudentCard } from "@/app/components/modules";

export default function ClassroomStudentDetailClient() {
  return (
    <ContentLayout title="" hideTitle={true}>
      <StudentCard>
        <ClassroomAddQuiz type="list" />
      </StudentCard>
    </ContentLayout>
  );
}

