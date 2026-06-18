import StudentInboxClient from "./StudentInboxClient";

export const metadata = {
  title: "Student Inbox — Pebbo",
  description:
    "View your Pebbo invitations and messages. Stay connected with your AI maths learning journey.",
  openGraph: {
    title: "Student Inbox — Pebbo",
    description: "Invitations and messages for your Pebbo account.",
    siteName: "Pebbo",
  },
};

export default function StudentInboxPage() {
  return <StudentInboxClient />;
}

