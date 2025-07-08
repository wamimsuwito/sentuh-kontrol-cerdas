
import { Button } from '@/components/ui/button';
import { RelayItem } from '@/types/relay';
import { useProductData } from '@/hooks/useProductData';
import { Edit, Image, Timer, ToggleLeft, ToggleRight } from 'lucide-react';

interface ProductItemProps {
  product: RelayItem;
  isProductEnabled: boolean;
  isCategoryEnabled: boolean;
  onToggleProduct: (productId: string, productName: string) => void;
  onEditProduct: (product: RelayItem) => void;
}

const ProductItem = ({ 
  product, 
  isProductEnabled, 
  isCategoryEnabled, 
  onToggleProduct, 
  onEditProduct 
}: ProductItemProps) => {
  const { getProductName, getProductBarcodeImage, getProductTimerDuration } = useProductData();
  
  const productName = getProductName(product);
  const hasBarcode = getProductBarcodeImage(product.id);
  const timerDuration = getProductTimerDuration(product.id);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <div className="text-sm">🛍️</div>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{productName}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Relay #{product.relayNumber}</span>
            <div className="flex items-center gap-1 text-blue-600">
              <Timer className="w-3 h-3" />
              <span>{timerDuration}s</span>
            </div>
            {hasBarcode && (
              <div className="flex items-center gap-1 text-green-600">
                <Image className="w-3 h-3" />
                <span>Barcode</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onEditProduct(product)}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          <Edit className="w-4 h-4" />
        </Button>
        
        <span className={`text-sm font-medium ${isProductEnabled ? 'text-green-600' : 'text-red-600'}`}>
          {isProductEnabled ? 'Tersedia' : 'Habis'}
        </span>
        <Button
          onClick={() => onToggleProduct(product.id, productName)}
          variant="ghost"
          size="sm"
          className={`p-1 ${isProductEnabled ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
          disabled={!isCategoryEnabled}
        >
          {isProductEnabled ? 
            <ToggleRight className="w-6 h-6" /> : 
            <ToggleLeft className="w-6 h-6" />
          }
        </Button>
      </div>
    </div>
  );
};

export default ProductItem;
