import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Quizzes | ${APP_NAME}`,
};

export default function layout({ children }) {
  return children;
}
