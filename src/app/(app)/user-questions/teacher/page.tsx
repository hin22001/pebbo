import UserQuestionsTeacherClient from "./UserQuestionsTeacherClient";

export const metadata = {
  title: "User Questions — Pebbo",
  description:
    "Manage user maths questions. Browse and moderate questions for your school on Pebbo.",
  openGraph: {
    title: "User Questions — Pebbo",
    description: "Manage user questions for Pebbo educators.",
    siteName: "Pebbo",
  },
};

export default function UserQuestionsTeacherPage() {
  return <UserQuestionsTeacherClient />;
}
