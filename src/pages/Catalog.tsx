import { CatalogBuilder } from "@/components/CatalogBuilder";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Catalog = () => {
  return (
    <ThemeProvider>
      <CatalogBuilder />
    </ThemeProvider>
  );
};

export default Catalog;
