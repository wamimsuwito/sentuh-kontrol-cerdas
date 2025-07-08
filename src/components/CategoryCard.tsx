
import { RelayCategory } from "@/types/relay";

interface CategoryCardProps {
  category: RelayCategory;
  onClick: () => void;
  disabled?: boolean;
  isProductEnabled?: (productId: string) => boolean;
}

const CategoryCard = ({ category, onClick, disabled = false, isProductEnabled }: CategoryCardProps) => {
  // Check if all products in category are disabled
  const allProductsDisabled = isProductEnabled && 
    category.items.every(item => !isProductEnabled(item.id));

  const isDisabled = disabled || allProductsDisabled;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-6 rounded-2xl text-center transition-all duration-200 transform
        ${isDisabled 
          ? 'bg-gray-200 cursor-not-allowed opacity-50' 
          : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 active:scale-95'
        }
        text-white shadow-lg
      `}
    >
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-2xl flex items-center justify-center">
          <span className="text-red-500 font-semibold text-sm">Produk Habis</span>
        </div>
      )}
      
      <div className="text-4xl mb-3">{category.emoji}</div>
      <h3 className="text-sm font-semibold leading-tight">
        {category.name}
      </h3>
    </button>
  );
};

export default CategoryCard;
