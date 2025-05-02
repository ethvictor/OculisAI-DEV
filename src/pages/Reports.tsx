
import { BarChart2 } from "lucide-react";

const Reports = () => {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BarChart2 className="h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Rapporter</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Denna sida är under utveckling. Här kommer du att kunna se analyser och rapporter baserade på dina URL-granskningar.
        </p>
      </div>
    </div>
  );
};

export default Reports;
