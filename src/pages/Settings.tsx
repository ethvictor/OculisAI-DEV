import { Settings as SettingsIcon } from "lucide-react";
import SubscriptionPlans from "../components/SubscriptionPlans";

const Settings = () => {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <SettingsIcon className="h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Inställningar</h1>
        <p className="text-muted-foreground text-lg max-w-md mb-6">
          Hantera din prenumeration nedan.
        </p>

        {/* Prenumerationsval */}
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default Settings;
