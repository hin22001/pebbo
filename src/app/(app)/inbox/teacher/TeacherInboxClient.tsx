"use client";

import React from "react";
import { Invitations } from "@/app/components/templates";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { TeacherCard } from "@/app/components/modules";

export default function TeacherInboxClient() {
  return (
    <ContentLayout>
      <TeacherCard>
        <Invitations />
      </TeacherCard>
    </ContentLayout>
  );
}
