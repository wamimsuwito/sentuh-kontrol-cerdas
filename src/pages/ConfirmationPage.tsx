
import { Button } from "@/components/ui/button";
import { RelayItem } from "@/types/relay";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useState, useEffect } from "react";
import { useAutoReturn } from "@/hooks/useAutoReturn";
import { useProductData } from "@/hooks/useProductData";
import { useBarcodeDisplaySettings } from "@/hooks/useBarcodeDisplaySettings";

interface ConfirmationPageProps {
  item: RelayItem;
  onBack: () => void;
  onConfirm: () => void;
  limitSwitchPressed?: boolean;
  buttonEnabled?: boolean;
  onCancelCountdown?: () => void;
}

const ConfirmationPage = ({ 
  item, 
  onBack, 
  onConfirm, 
  limitSwitchPressed = false, 
  buttonEnabled = false,
  onCancelCountdown
}: ConfirmationPageProps) => {
  const [countdown, setCountdown] = useState(20);
  const { getProductBarcodeImage, getProductName } = useProductData();
  const { getBarcodeDisplayTime } = useBarcodeDisplaySettings();

  // Get configured display time from admin settings
  const displayTime = getBarcodeDisplayTime();

  const { clearTimer } = useAutoReturn({
    onReturn: () => {
      console.log(`Auto-return: Kembali ke halaman awal setelah ${displayTime} detik tidak ada aktivitas`);
      if (onCancelCountdown) {
        onCancelCountdown();
      }
      onBack();
    },
    timeout: displayTime * 1000 // convert to milliseconds
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (buttonEnabled) {
      setCountdown(displayTime);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [buttonEnabled, displayTime]);

  const handleBack = () => {
    clearTimer();
    if (onCancelCountdown) {
      onCancelCountdown();
    }
    onBack();
  };

  const handleConfirm = () => {
    clearTimer();
    onConfirm();
  };

  // Get custom barcode image or use default QR code
  const customBarcodeImage = getProductBarcodeImage(item.id);
  const productName = getProductName(item);
  
  // Default QR codes for products that don't have custom images
  const getDefaultQRCodeImage = () => {
    if (item.id === "kopi-hitam" || item.id === "kapal-api-mix" || item.id === "gula-aren" || item.id === "susu-panas") {
      return "/lovable-uploads/88446db9-6e61-4615-bcb3-1ec50d075486.png";
    } else if (item.id === "es-kopi") {
      return "/lovable-uploads/d7f38623-fb17-468b-8c3e-b5f11fd7cc10.png";
    } else if (item.id === "es-teh") {
      return "/lovable-uploads/03b073ec-4046-47bd-bb2f-348e83863c05.png";
    } else if (item.id === "es-jeruk") {
      return "/lovable-uploads/8156f46e-f428-4fc3-814e-aa726499caac.png";
    } else if (item.id === "jus-buah") {
      return "/lovable-uploads/92e76fbb-2789-4aff-bc02-eafac3f90eb5.png";
    } else if (item.id === "keripik" || item.id === "biskuit") {
      return "/lovable-uploads/05d334eb-f186-40ac-9cab-fdb2d89ba21d.png";
    } else if (item.id === "kacang") {
      return "/lovable-uploads/2aed95a5-e7cd-4e77-9cc0-fcc9182369ec.png";
    } else if (item.id === "permen") {
      return "/lovable-uploads/2a539651-38aa-453c-be87-0a7610b0ffad.png";
    } else if (item.id === "marlboro" || item.id === "sampoerna") {
      return "/lovable-uploads/48ed4f68-5344-45b2-bfa6-61f858244717.png";
    } else if (item.id === "gudang-garam" || item.id === "djarum") {
      return "/lovable-uploads/5caa1762-dfc2-4331-abda-a1bae5f38f7f.png";
    }
    return "";
  };

  const qrCodeImage = customBarcodeImage || getDefaultQRCodeImage();
  const showQRCode = !!qrCodeImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl p-6 text-center shadow-xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Silakan scan barcode untuk melanjutkan
          </h1>
          
          <ProgressIndicator progress={75} />
          
          {showQRCode && (
            <div className="my-6 p-4 border-4 border-red-400 border-dashed rounded-2xl bg-red-50">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <img 
                  src={qrCodeImage}
                  alt={`QR Code untuk ${productName}`}
                  className="w-32 h-32 mx-auto object-contain"
                />
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Scan QR Code untuk {productName}
                </p>
              </div>
            </div>
          )}
          
          <p className={`text-gray-600 mb-4 mt-4 ${limitSwitchPressed ? 'text-green-600 font-semibold' : ''}`}>
            {buttonEnabled ? `Pembayaran anda diterima! Silakan tekan tombol lanjut sebelum ${countdown} detik` : 
             limitSwitchPressed ? 'Sinyal diterima dari perangkat!' : 
             'Silakan lakukan pembayaran'}
          </p>

          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              buttonEnabled 
                ? 'bg-green-100 text-green-800' 
                : limitSwitchPressed 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                buttonEnabled ? 'bg-green-500' : 
                limitSwitchPressed ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
              }`}></div>
              <span className={buttonEnabled ? '' : 'animate-pulse text-red-600 font-semibold'}>
                {buttonEnabled ? 'Pembayaran BERHASIL' : 'Menunggu PEMBAYARAN'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Kembali
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!buttonEnabled}
            className={`flex-1 py-2 text-white transition-all ${
              buttonEnabled 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Lanjut →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
