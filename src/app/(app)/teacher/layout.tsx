import { ReactNode } from "react";

export const metadata = {
  title: "Pebbo · Teacher",
  description: "Pebbo Teacher Portal",
};

export default function TeacherAppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
