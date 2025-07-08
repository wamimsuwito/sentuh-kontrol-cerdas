
import { Button } from "@/components/ui/button";

interface ConnectionStatusProps {
  isConnected: boolean;
  onDisconnect: () => void;
}

const ConnectionStatus = ({ isConnected, onDisconnect }: ConnectionStatusProps) => {
  return (
    <div className="flex justify-between items-center p-4 pt-8">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm"
          className="bg-white text-blue-600"
          disabled={!isConnected}
        >
          Hubungkan
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-white border-white hover:bg-white hover:text-blue-600"
          onClick={onDisconnect}
        >
          Terputus
        </Button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
