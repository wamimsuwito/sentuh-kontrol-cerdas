
import { useState, useEffect } from 'react';

interface CategorySettings {
  [categoryId: string]: boolean; // true = enabled, false = disabled
}

export const useCategorySettings = () => {
  const [categorySettings, setCategorySettings] = useState<CategorySettings>({
    'aneka-kopi': true,
    'minuman-dingin': true,
    'makanan-ringan': true,
    'rokok-ketengah': true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('categorySettings');
    if (savedSettings) {
      setCategorySettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateCategoryStatus = (categoryId: string, enabled: boolean) => {
    const newSettings = {
      ...categorySettings,
      [categoryId]: enabled
    };
    setCategorySettings(newSettings);
    localStorage.setItem('categorySettings', JSON.stringify(newSettings));
  };

  const isCategoryEnabled = (categoryId: string): boolean => {
    return categorySettings[categoryId] ?? true;
  };

  return {
    categorySettings,
    updateCategoryStatus,
    isCategoryEnabled
  };
};
