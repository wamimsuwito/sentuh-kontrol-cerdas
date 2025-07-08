
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBarcodeDisplaySettings } from '@/hooks/useBarcodeDisplaySettings';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

const BarcodeDisplaySettings = () => {
  const { settings, isLoaded, updateDisplayTime } = useBarcodeDisplaySettings();
  const { toast } = useToast();
  const [displayTime, setDisplayTime] = useState(20);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    if (isLoaded && !isFormInitialized) {
      console.log('🔄 Initializing barcode display settings form');
      setDisplayTime(settings.displayTime);
      setIsFormInitialized(true);
    }
  }, [isLoaded, settings.displayTime, isFormInitialized]);

  const handleSave = () => {
    if (displayTime < 5 || displayTime > 60) {
      toast({
        title: "Error",
        description: "Waktu tampil barcode harus antara 5-60 detik!",
        variant: "destructive",
      });
      return;
    }

    console.log('💾 Menyimpan pengaturan waktu tampil barcode:', displayTime);
    updateDisplayTime(displayTime);

    toast({
      title: "Pengaturan Berhasil Disimpan",
      description: `Waktu tampil barcode diubah menjadi ${displayTime} detik.`,
    });
  };

  const handleReset = () => {
    setDisplayTime(20);
    updateDisplayTime(20);
    
    toast({
      title: "Pengaturan Direset",
      description: "Waktu tampil barcode dikembalikan ke 20 detik.",
    });
  };

  if (!isLoaded || !isFormInitialized) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat pengaturan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Pengaturan Waktu Tampil Barcode</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="display-time" className="text-sm font-medium text-gray-700">
            Waktu Tampil Barcode (detik)
          </Label>
          <Input
            id="display-time"
            type="number"
            min="5"
            max="60"
            value={displayTime}
            onChange={(e) => setDisplayTime(parseInt(e.target.value) || 20)}
            className="mt-1"
            placeholder="Masukkan waktu dalam detik"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimal 5 detik, maksimal 60 detik
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Simpan Pengaturan
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset ke Default
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeDisplaySettings;
