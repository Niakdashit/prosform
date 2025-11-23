import { FormBuilder } from "@/components/FormBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Index = () => {
  return (
    <ThemeProvider>
      <FormBuilder />
    </ThemeProvider>
  );
};

export default Index;
