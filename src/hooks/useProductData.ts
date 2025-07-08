
import { useState, useEffect, useCallback } from 'react';
import { RelayItem } from '@/types/relay';
import { relayCategories } from '@/data/relayData';

interface ProductData {
  [productId: string]: {
    name: string;
    barcodeImage?: string;
    timerDuration: number;
  };
}

export const useProductData = () => {
  const [productData, setProductData] = useState<ProductData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('🔄 Loading product data from localStorage...');
    try {
      const savedData = localStorage.getItem('productData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('📦 Product data loaded:', parsedData);
        setProductData(parsedData);
      } else {
        console.log('📦 No product data found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error loading product data:', error);
    }
    setIsLoaded(true);
  }, []);

  const saveToLocalStorage = useCallback((data: ProductData) => {
    try {
      console.log('💾 Saving product data to localStorage:', data);
      localStorage.setItem('productData', JSON.stringify(data));
      console.log('✅ Product data saved successfully');
    } catch (error) {
      console.error('❌ Error saving product data:', error);
    }
  }, []);

  const updateProductData = useCallback((productId: string, data: { name?: string; barcodeImage?: string; timerDuration?: number }) => {
    console.log('🔄 Updating product data for:', productId, data);
    
    setProductData(prevData => {
      const currentProduct = prevData[productId] || { name: '', timerDuration: 3 };
      
      const newProductData = {
        name: data.name !== undefined ? data.name : currentProduct.name,
        barcodeImage: data.barcodeImage !== undefined ? data.barcodeImage : currentProduct.barcodeImage,
        timerDuration: data.timerDuration !== undefined ? data.timerDuration : currentProduct.timerDuration
      };

      const newData = {
        ...prevData,
        [productId]: newProductData
      };

      console.log('📝 New product data state:', newData);
      saveToLocalStorage(newData);
      
      return newData;
    });
  }, [saveToLocalStorage]);

  const getProductName = useCallback((product: RelayItem): string => {
    const customName = productData[product.id]?.name;
    const name = customName && customName.trim() !== '' ? customName : product.name;
    console.log('📖 Getting product name for', product.id, ':', name);
    return name;
  }, [productData]);

  const getProductBarcodeImage = useCallback((productId: string): string | undefined => {
    const image = productData[productId]?.barcodeImage;
    console.log('🖼️ Getting barcode image for', productId, ':', !!image);
    return image;
  }, [productData]);

  const getProductTimerDuration = useCallback((productId: string): number => {
    const duration = productData[productId]?.timerDuration ?? 3;
    console.log('⏱️ Getting timer duration for', productId, ':', duration);
    return duration;
  }, [productData]);

  const getAllProducts = useCallback((): RelayItem[] => {
    return relayCategories.flatMap(category => category.items);
  }, []);

  return {
    productData,
    isLoaded,
    updateProductData,
    getProductName,
    getProductBarcodeImage,
    getProductTimerDuration,
    getAllProducts
  };
};
