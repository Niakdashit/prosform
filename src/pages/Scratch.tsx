import { ScratchBuilder } from "@/components/ScratchBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Scratch = () => {
  return (
    <ThemeProvider>
      <ScratchBuilder />
    </ThemeProvider>
  );
};

export default Scratch;
