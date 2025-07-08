
import { useCallback, useEffect } from "react";
import { Settings } from "lucide-react";
import { RelayItem } from "@/types/relay";
import { useProductData } from "@/hooks/useProductData";
import CountdownTimer from "@/components/CountdownTimer";
import { useAudioManager } from "@/hooks/useAudioManager";

interface ProcessingPageProps {
  item: RelayItem;
  onComplete: () => void;
  limitSwitchPressed?: boolean;
}

const ProcessingPage = ({ item, onComplete, limitSwitchPressed }: ProcessingPageProps) => {
  const { getProductTimerDuration, getProductName } = useProductData();
  const { stopAudio } = useAudioManager();

  const handleComplete = useCallback(() => {
    console.log('✅ Processing completed for:', item.name);
    // Stop processing audio when complete
    stopAudio('processing-active');
    onComplete();
  }, [onComplete, item.name, stopAudio]);

  // Cleanup: stop audio when component unmounts
  useEffect(() => {
    return () => {
      stopAudio('processing-active');
    };
  }, [stopAudio]);

  const timerDuration = getProductTimerDuration(item.id);
  const productName = getProductName(item);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-8">
          Pesanan anda sedang diproses, mohon tunggu...
        </h1>

        <div className="mb-8">
          <CountdownTimer 
            duration={timerDuration} 
            onComplete={handleComplete}
          />
        </div>

        <p className="text-xl mb-4">
          Relay {item.relayNumber} - {productName}
        </p>
      </div>
    </div>
  );
};

export default ProcessingPage;
