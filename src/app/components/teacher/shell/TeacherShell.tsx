import { ReactNode } from "react";
import { TeacherSidebar } from "./TeacherSidebar";
import { TeacherHeader } from "./TeacherHeader";

export interface TeacherShellProps {
  children: ReactNode;
}

export function TeacherShell({ children }: TeacherShellProps) {
  return (
    <div className="flex min-h-screen bg-surface-0">
      <TeacherSidebar />
      <div className="flex flex-1 flex-col">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto bg-surface-1">{children}</main>
      </div>
    </div>
  );
}
