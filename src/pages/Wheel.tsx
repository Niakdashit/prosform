import { WheelBuilder } from "@/components/WheelBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Wheel = () => {
  return (
    <ThemeProvider>
      <WheelBuilder />
    </ThemeProvider>
  );
};

export default Wheel;
