import TeacherInboxClient from "./TeacherInboxClient";

export const metadata = {
  title: "Teacher Inbox — Pebbo",
  description:
    "Your Pebbo teacher inbox. View invitations, messages, and notifications.",
  openGraph: {
    title: "Teacher Inbox — Pebbo",
    description: "Teacher invitations and inbox for Pebbo educators.",
    siteName: "Pebbo",
  },
};

export default function TeacherInboxPage() {
  return <TeacherInboxClient />;
}
