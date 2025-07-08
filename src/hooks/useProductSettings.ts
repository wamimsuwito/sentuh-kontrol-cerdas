
import { useState, useEffect } from 'react';

interface ProductSettings {
  [productId: string]: boolean; // true = enabled, false = disabled
}

export const useProductSettings = () => {
  const [productSettings, setProductSettings] = useState<ProductSettings>({});

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('productSettings');
    if (savedSettings) {
      setProductSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateProductStatus = (productId: string, enabled: boolean) => {
    const newSettings = {
      ...productSettings,
      [productId]: enabled
    };
    setProductSettings(newSettings);
    localStorage.setItem('productSettings', JSON.stringify(newSettings));
  };

  const isProductEnabled = (productId: string): boolean => {
    return productSettings[productId] ?? true;
  };

  return {
    productSettings,
    updateProductStatus,
    isProductEnabled
  };
};
