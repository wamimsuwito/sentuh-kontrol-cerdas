import { Card, CardContent } from "@/components/ui/card";
import { RelayItem } from "@/types/relay";
import { useProductData } from "@/hooks/useProductData";
import { Cigarette, Coffee, CupSoda, Droplets } from "lucide-react";

interface ItemCardProps {
  item: RelayItem;
  onClick: () => void;
  disabled?: boolean;
}

const ItemCard = ({ item, onClick, disabled = false }: ItemCardProps) => {
  const { getProductName } = useProductData();
  const productName = getProductName(item);

  const getItemIcon = (item: RelayItem) => {
    // Rokok Ketengah category
    if (item.category === "rokok-ketengah") {
      return <Cigarette className="w-8 h-8 text-white" />;
    }
    
    // Aneka Kopi category - coffee related items
    if (item.category === "aneka-kopi") {
      if (item.name.toLowerCase().includes("kopi")) {
        return <Coffee className="w-8 h-8 text-white" />;
      }
      if (item.name.toLowerCase().includes("susu")) {
        return <div className="text-3xl">🥛</div>;
      }
      if (item.name.toLowerCase().includes("gula")) {
        return <div className="text-3xl">🍯</div>;
      }
      return <Coffee className="w-8 h-8 text-white" />;
    }
    
    // Minuman Dingin category - cold drinks
    if (item.category === "minuman-dingin") {
      if (item.name.toLowerCase().includes("teh")) {
        return <div className="text-3xl">🧊</div>;
      }
      if (item.name.toLowerCase().includes("susu")) {
        return <div className="text-3xl">🥛</div>;
      }
      if (item.name.toLowerCase().includes("mizone")) {
        return <CupSoda className="w-8 h-8 text-white" />;
      }
      if (item.name.toLowerCase().includes("air")) {
        return <Droplets className="w-8 h-8 text-white" />;
      }
      return <CupSoda className="w-8 h-8 text-white" />;
    }
    
    // Makanan Ringan category - snacks and instant noodles
    if (item.category === "makanan-ringan") {
      if (item.name.toLowerCase().includes("pop mie")) {
        return <div className="text-3xl">🍜</div>;
      }
      if (item.name.toLowerCase().includes("roma")) {
        return <div className="text-3xl">🍪</div>;
      }
      if (item.name.toLowerCase().includes("teh manis panas")) {
        return <div className="text-3xl">☕</div>;
      }
      return <div className="text-3xl">🍟</div>;
    }
    
    // Default fallback
    return <div className="text-3xl">☕</div>;
  };

  return (
    <Card 
      className={`
        ${disabled 
          ? 'bg-gray-200 cursor-not-allowed opacity-50' 
          : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer hover:scale-105'
        }
        transition-all duration-300 transform shadow-lg hover:shadow-xl border-0 relative
      `}
      onClick={disabled ? undefined : onClick}
    >
      {disabled && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-lg flex items-center justify-center">
          <span className="text-red-500 font-semibold text-xs">Habis</span>
        </div>
      )}
      <CardContent className="flex flex-col items-center justify-center p-6 text-white min-h-[120px]">
        <div className="mb-3">{getItemIcon(item)}</div>
        <h3 className="text-sm font-bold text-center leading-tight">{productName}</h3>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
