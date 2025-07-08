
import { Button } from '@/components/ui/button';
import { RelayCategory } from '@/types/relay';
import { ChevronDown, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import ProductItem from './ProductItem';

interface CategoryItemProps {
  category: RelayCategory;
  isCategoryEnabled: boolean;
  isExpanded: boolean;
  productSettings: { [key: string]: boolean };
  onToggleCategory: (categoryId: string, categoryName: string) => void;
  onToggleExpansion: (categoryId: string) => void;
  onToggleProduct: (productId: string, productName: string) => void;
  onEditProduct: (product: any) => void;
}

const CategoryItem = ({
  category,
  isCategoryEnabled,
  isExpanded,
  productSettings,
  onToggleCategory,
  onToggleExpansion,
  onToggleProduct,
  onEditProduct
}: CategoryItemProps) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Category Header */}
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => onToggleExpansion(category.id)}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            {isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </Button>
          <div className="text-3xl">{category.emoji}</div>
          <div>
            <h3 className="font-semibold text-gray-800">{category.name}</h3>
            <p className="text-sm text-gray-600">
              {category.items.length} item tersedia
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isCategoryEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {isCategoryEnabled ? 'Aktif' : 'Nonaktif'}
          </span>
          <Button
            onClick={() => onToggleCategory(category.id, category.name)}
            variant="ghost"
            size="sm"
            className={`p-1 ${isCategoryEnabled ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
          >
            {isCategoryEnabled ? 
              <ToggleRight className="w-8 h-8" /> : 
              <ToggleLeft className="w-8 h-8" />
            }
          </Button>
        </div>
      </div>

      {/* Products List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          {category.items.map((product) => {
            const isProductEnabled = productSettings[product.id] ?? true;
            
            return (
              <ProductItem
                key={product.id}
                product={product}
                isProductEnabled={isProductEnabled}
                isCategoryEnabled={isCategoryEnabled}
                onToggleProduct={onToggleProduct}
                onEditProduct={onEditProduct}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
