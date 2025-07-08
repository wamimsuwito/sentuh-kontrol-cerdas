
import { useToast } from '@/hooks/use-toast';

interface UseConnectionFlowProps {
  isNative: boolean;
  connectToESP32: () => Promise<void>;
  disconnect: () => Promise<void>;
  onConnectionSuccess: () => void;
  onDisconnectionSuccess: () => void;
}

export const useConnectionFlow = ({
  isNative,
  connectToESP32,
  disconnect,
  onConnectionSuccess,
  onDisconnectionSuccess
}: UseConnectionFlowProps) => {
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectToESP32();
      
      const connectionType = isNative ? 'Native' : 'Web' + ' Bluetooth';
      
      toast({
        title: "Berhasil Terhubung!",
        description: `ESP32 telah terhubung via ${connectionType} dan siap digunakan. Sensor pelanggan aktif.`,
      });
      
      onConnectionSuccess();
    } catch (error) {
      toast({
        title: "Gagal Terhubung",
        description: "Tidak dapat terhubung ke ESP32. Periksa koneksi Bluetooth.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    onDisconnectionSuccess();
    toast({
      title: "Terputus",
      description: "Koneksi ke ESP32 telah diputus. Sensor pelanggan tidak aktif.",
    });
  };

  return {
    handleConnect,
    handleDisconnect
  };
};
