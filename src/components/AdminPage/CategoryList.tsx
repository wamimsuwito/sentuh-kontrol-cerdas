
import { relayCategories } from '@/data/relayData';
import CategoryItem from './CategoryItem';

interface CategoryListProps {
  categorySettings: { [key: string]: boolean };
  productSettings: { [key: string]: boolean };
  expandedCategories: Set<string>;
  onToggleCategory: (categoryId: string, categoryName: string) => void;
  onToggleExpansion: (categoryId: string) => void;
  onToggleProduct: (productId: string, productName: string) => void;
  onEditProduct: (product: any) => void;
}

const CategoryList = ({
  categorySettings,
  productSettings,
  expandedCategories,
  onToggleCategory,
  onToggleExpansion,
  onToggleProduct,
  onEditProduct
}: CategoryListProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Pengaturan Kategori & Produk</h2>
      
      <div className="space-y-4">
        {relayCategories.map((category) => {
          const isCategoryEnabled = categorySettings[category.id] ?? true;
          const isExpanded = expandedCategories.has(category.id);
          
          return (
            <CategoryItem
              key={category.id}
              category={category}
              isCategoryEnabled={isCategoryEnabled}
              isExpanded={isExpanded}
              productSettings={productSettings}
              onToggleCategory={onToggleCategory}
              onToggleExpansion={onToggleExpansion}
              onToggleProduct={onToggleProduct}
              onEditProduct={onEditProduct}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoryList;
