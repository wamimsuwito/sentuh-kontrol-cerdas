
import { useState, useEffect, useCallback } from 'react';

interface BarcodeDisplaySettings {
  displayTime: number; // dalam detik
}

export const useBarcodeDisplaySettings = () => {
  const [settings, setSettings] = useState<BarcodeDisplaySettings>({
    displayTime: 20 // default 20 detik
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('🔄 Loading barcode display settings from localStorage...');
    try {
      const savedSettings = localStorage.getItem('barcodeDisplaySettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('📦 Barcode display settings loaded:', parsedSettings);
        setSettings(parsedSettings);
      } else {
        console.log('📦 No barcode display settings found, using defaults');
      }
    } catch (error) {
      console.error('❌ Error loading barcode display settings:', error);
    }
    setIsLoaded(true);
  }, []);

  const saveToLocalStorage = useCallback((newSettings: BarcodeDisplaySettings) => {
    try {
      console.log('💾 Saving barcode display settings to localStorage:', newSettings);
      localStorage.setItem('barcodeDisplaySettings', JSON.stringify(newSettings));
      console.log('✅ Barcode display settings saved successfully');
    } catch (error) {
      console.error('❌ Error saving barcode display settings:', error);
    }
  }, []);

  const updateDisplayTime = useCallback((displayTime: number) => {
    console.log('🔄 Updating barcode display time to:', displayTime);
    
    const newSettings = {
      ...settings,
      displayTime: Math.max(5, Math.min(60, displayTime)) // batasi antara 5-60 detik
    };

    setSettings(newSettings);
    saveToLocalStorage(newSettings);
  }, [settings, saveToLocalStorage]);

  const getBarcodeDisplayTime = useCallback(() => {
    return settings.displayTime;
  }, [settings.displayTime]);

  return {
    settings,
    isLoaded,
    updateDisplayTime,
    getBarcodeDisplayTime
  };
};
