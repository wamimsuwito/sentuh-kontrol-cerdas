
import { useToast } from '@/hooks/use-toast';
import { useProductData } from '@/hooks/useProductData';
import { useAudioManager } from '@/hooks/useAudioManager';

interface UseOrderFlowProps {
  selectedItem: any;
  buttonEnabled: boolean;
  activateRelay: (relayNumber: number) => void;
  handleButtonPress: () => void;
  setButtonTimeout: (callback: () => void) => void;
  cancelCountdown: () => void;
  onProcessingStart: () => void;
  onOrderComplete: () => void;
  onOrderCancel: () => void;
}

export const useOrderFlow = ({
  selectedItem,
  buttonEnabled,
  activateRelay,
  handleButtonPress,
  setButtonTimeout,
  cancelCountdown,
  onProcessingStart,
  onOrderComplete,
  onOrderCancel
}: UseOrderFlowProps) => {
  const { toast } = useToast();
  const { getProductTimerDuration } = useProductData();
  const { playAudio, stopAudio } = useAudioManager();

  const startOrderTimeout = () => {
    setButtonTimeout(() => {
      // Stop limit switch audio when timeout occurs
      stopAudio('limit-switch-active');
      toast({
        title: "Waktu Habis",
        description: "Tombol tidak ditekan dalam 20 detik. Kembali ke halaman utama.",
        variant: "destructive",
      });
      onOrderCancel();
    });
  };

  const handleConfirm = () => {
    if (selectedItem && buttonEnabled) {
      // LANGSUNG STOP AUDIO LIMIT SWITCH SAAT TOMBOL DIKLIK
      console.log('🔇 MENGHENTIKAN AUDIO LIMIT SWITCH - TOMBOL LANJUT DIKLIK');
      stopAudio('limit-switch-active');
      
      handleButtonPress();
      
      const timerDuration = getProductTimerDuration(selectedItem.id);
      console.log(`🚀 Mengaktifkan relay ${selectedItem.relayNumber} untuk ${timerDuration} detik`);
      
      activateRelay(selectedItem.relayNumber);
      
      // Wait 2 seconds before starting processing audio and navigating to processing page
      setTimeout(() => {
        console.log('🔊 Memulai audio processing setelah jeda 2 detik');
        playAudio('processing-active');
        onProcessingStart();
      }, 2000);
      
      toast({
        title: "Relay Diaktifkan",
        description: `Relay ${selectedItem.relayNumber} (${selectedItem.name}) akan aktif selama ${timerDuration} detik`,
      });
    }
  };

  const handleProcessingComplete = () => {
    // Stop processing audio when complete
    stopAudio('processing-active');
    toast({
      title: "Pesanan Selesai",
      description: "Terima kasih! Ambil pesanan Anda.",
    });
    onOrderComplete();
  };

  const handleCancelOrder = () => {
    // Stop all audio when canceling order
    console.log('🔇 MENGHENTIKAN SEMUA AUDIO - CANCEL ORDER');
    stopAudio('limit-switch-active');
    stopAudio('processing-active');
    cancelCountdown();
    onOrderCancel();
  };

  return {
    startOrderTimeout,
    handleConfirm,
    handleProcessingComplete,
    handleCancelOrder
  };
};
