
import { RelayCategory, RelayItem } from "@/types/relay";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAutoReturn } from "@/hooks/useAutoReturn";

interface CategoryPageProps {
  category: RelayCategory;
  onItemSelect: (item: RelayItem) => void;
  onBack: () => void;
  isProductEnabled: (productId: string) => boolean;
}

const CategoryPage = ({ category, onItemSelect, onBack, isProductEnabled }: CategoryPageProps) => {
  // Auto-return to home after 15 seconds of inactivity
  useAutoReturn({
    onReturn: onBack,
    timeout: 15000
  });

  const handleItemSelect = (item: RelayItem) => {
    if (isProductEnabled(item.id)) {
      onItemSelect(item);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 relative">
      <div className="px-6 py-8 pb-20">
        <div className="bg-white rounded-3xl p-8 mx-auto max-w-md">
          {/* Category header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{category.emoji}</div>
            <h1 className="text-3xl font-bold text-blue-600 mb-4">{category.name}</h1>
            <p className="text-gray-600 text-lg">
              Kamu mau {category.name.toLowerCase()} apa?
            </p>
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-2 gap-4">
            {category.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemSelect(item)}
                disabled={!isProductEnabled(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Back button fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white hover:text-white border-0 shadow-lg backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
