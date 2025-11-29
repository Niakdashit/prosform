import { JackpotBuilder } from "@/components/JackpotBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Jackpot = () => {
  return (
    <ThemeProvider>
      <JackpotBuilder />
    </ThemeProvider>
  );
};

export default Jackpot;
