"use client";

import React from "react";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { StudentCard } from "@/app/components/modules";
import { Profile } from "@/app/components/templates";

type StudentProfileClientProps = {
  initialProfileData?: any;
  initialSummaryData?: any;
};

export default function StudentProfileClient({
  initialProfileData,
  initialSummaryData,
}: StudentProfileClientProps) {
  return (
    <ContentLayout>
      <StudentCard>
        <Profile
          initialProfileData={initialProfileData}
          initialSummaryData={initialSummaryData}
        />
      </StudentCard>
    </ContentLayout>
  );
}

