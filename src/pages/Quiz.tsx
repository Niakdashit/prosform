import { QuizBuilder } from "@/components/QuizBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Quiz = () => {
  return (
    <ThemeProvider>
      <QuizBuilder />
    </ThemeProvider>
  );
};

export default Quiz;
