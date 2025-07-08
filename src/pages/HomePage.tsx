
import { RelayCategory } from "@/types/relay";
import ConnectionStatus from "@/components/ConnectionStatus";
import WelcomeSection from "@/components/WelcomeSection";
import CategoryGrid from "@/components/CategoryGrid";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useCategorySettings } from "@/hooks/useCategorySettings";
import { useProductSettings } from "@/hooks/useProductSettings";

interface HomePageProps {
  isConnected: boolean;
  onDisconnect: () => void;
  onCategorySelect: (category: RelayCategory) => void;
  onAdminClick: () => void;
}

const HomePage = ({ 
  isConnected, 
  onDisconnect, 
  onCategorySelect,
  onAdminClick
}: HomePageProps) => {
  const { isCategoryEnabled } = useCategorySettings();
  const { isProductEnabled } = useProductSettings();

  const handleCategorySelect = (category: RelayCategory) => {
    // Only allow selection if category is enabled
    if (isCategoryEnabled(category.id)) {
      onCategorySelect(category);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600">
      <ConnectionStatus 
        isConnected={isConnected}
        onDisconnect={onDisconnect}
      />

      {/* Admin Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={onAdminClick}
          variant="ghost"
          size="sm"
          className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 backdrop-blur-sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </div>

      <div className="px-6 py-4">
        <div className="bg-white rounded-3xl p-8 mx-auto max-w-md">
          <WelcomeSection />
          <CategoryGrid 
            onCategorySelect={handleCategorySelect}
            isCategoryEnabled={isCategoryEnabled}
            isProductEnabled={isProductEnabled}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
