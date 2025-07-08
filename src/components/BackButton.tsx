
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton = ({ onClick, className = "" }: BackButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`flex items-center gap-2 text-blue-600 hover:text-blue-700 ${className}`}
    >
      <ArrowLeft size={20} />
      Kembali
    </Button>
  );
};

export default BackButton;
