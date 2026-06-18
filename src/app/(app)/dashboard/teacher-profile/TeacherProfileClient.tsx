"use client";

import React from "react";
import { Stack, Typography } from "@mui/material";
import { Profile } from "@/app/components/templates";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { TeacherCard } from "@/app/components/modules";

type TeacherProfileData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  school_name?: string | null;
  [key: string]: unknown;
};

type TeacherProfileClientProps = {
  initialProfileData?: TeacherProfileData | null;
};

export default function TeacherProfileClient({
  initialProfileData = null,
}: TeacherProfileClientProps) {
  const fullName = [
    initialProfileData?.first_name,
    initialProfileData?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const email = initialProfileData?.email || "";
  const schoolName = initialProfileData?.school_name || "";
  const displayName = fullName || email.split("@")[0] || "Teacher";
  const initials = (
    fullName
      ? fullName
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
      : email[0] || "T"
  ).toUpperCase();

  return (
    <ContentLayout>
      <TeacherCard>
        {/* Read-only identity header — name/email/school the editable Settings
            card below has no fields for. Hidden if the SSR fetch returned nothing. */}
        {initialProfileData && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ px: 0.5, pt: 0.5, mb: 2.5 }}
          >
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "#8264ff",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1 }}
              >
                {initials}
              </Typography>
            </Stack>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>
                {displayName}
              </Typography>
              <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 0.75 }}>
                {email && (
                  <Typography sx={{ fontSize: 13, color: "#6b6b6b" }}>
                    {email}
                  </Typography>
                )}
                {email && schoolName && (
                  <Typography sx={{ fontSize: 13, color: "#aaa" }}>·</Typography>
                )}
                {schoolName && (
                  <Typography sx={{ fontSize: 13, color: "#6b6b6b" }}>
                    {schoolName}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Feed initialProfileData so Profile populates the editable name and
            skips the student getProfile fetch (which 500s for teachers). The
            `?? {}` preserves that bypass even when the SSR fetch returned null. */}
        <Profile initialProfileData={initialProfileData ?? {}} />
      </TeacherCard>
    </ContentLayout>
  );
}
