
import { RelayCategory } from "@/types/relay";
import { relayCategories } from "@/data/relayData";
import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  onCategorySelect: (category: RelayCategory) => void;
  isCategoryEnabled: (categoryId: string) => boolean;
  isProductEnabled: (productId: string) => boolean;
}

const CategoryGrid = ({ onCategorySelect, isCategoryEnabled, isProductEnabled }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {relayCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={() => onCategorySelect(category)}
          disabled={!isCategoryEnabled(category.id)}
          isProductEnabled={isProductEnabled}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
