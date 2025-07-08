
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RelayItem } from '@/types/relay';
import { useProductData } from '@/hooks/useProductData';
import { useToast } from '@/hooks/use-toast';
import ProductNameInput from './ProductEditDialog/ProductNameInput';
import TimerDurationInput from './ProductEditDialog/TimerDurationInput';
import BarcodeImageUpload from './ProductEditDialog/BarcodeImageUpload';

interface ProductEditDialogProps {
  product: RelayItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductEditDialog = ({ product, isOpen, onClose }: ProductEditDialogProps) => {
  const { getProductName, getProductBarcodeImage, getProductTimerDuration, updateProductData, isLoaded } = useProductData();
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [barcodeImage, setBarcodeImage] = useState<string>('');
  const [timerDuration, setTimerDuration] = useState<number>(3);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Initialize form when dialog opens with a product and data is loaded
  useEffect(() => {
    if (product && isOpen && isLoaded) {
      console.log('🔄 Initializing form for product:', product.id);
      
      const currentName = getProductName(product);
      const currentImage = getProductBarcodeImage(product.id) || '';
      const currentDuration = getProductTimerDuration(product.id);
      
      console.log('📝 Setting form values:', {
        name: currentName,
        duration: currentDuration,
        hasImage: !!currentImage
      });
      
      setProductName(currentName);
      setBarcodeImage(currentImage);
      setTimerDuration(currentDuration);
      setIsFormInitialized(true);
    } else if (!isOpen) {
      // Reset form when dialog closes
      console.log('🔄 Resetting form state');
      setProductName('');
      setBarcodeImage('');
      setTimerDuration(3);
      setIsFormInitialized(false);
    }
  }, [product?.id, isOpen, isLoaded, getProductName, getProductBarcodeImage, getProductTimerDuration]);

  const handleSave = () => {
    if (!product) {
      console.log('❌ No product selected for saving');
      return;
    }

    console.log('💾 Menyimpan data produk:', {
      productId: product.id,
      name: productName,
      timerDuration: timerDuration,
      hasBarcodeImage: !!barcodeImage
    });

    // Ensure we have valid data before saving
    if (!productName.trim()) {
      toast({
        title: "Error",
        description: "Nama produk tidak boleh kosong!",
        variant: "destructive",
      });
      return;
    }

    if (timerDuration < 1 || timerDuration > 30) {
      toast({
        title: "Error",
        description: "Durasi timer harus antara 1-30 detik!",
        variant: "destructive",
      });
      return;
    }

    updateProductData(product.id, {
      name: productName.trim(),
      barcodeImage: barcodeImage,
      timerDuration: timerDuration
    });

    toast({
      title: "Produk Berhasil Diperbarui",
      description: `${productName} telah disimpan dengan timer ${timerDuration} detik.`,
    });

    console.log('✅ Product data saved successfully');
    onClose();
  };

  const handleClose = () => {
    console.log('🚪 Closing product edit dialog');
    onClose();
  };

  if (!product || !isLoaded) {
    console.log('⏳ Waiting for product or data to load...');
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <DialogDescription>
            Edit informasi produk, durasi timer relay, dan gambar barcode.
          </DialogDescription>
        </DialogHeader>
        
        {isFormInitialized ? (
          <div className="space-y-4">
            <ProductNameInput 
              value={productName} 
              onChange={setProductName} 
            />

            <TimerDurationInput 
              value={timerDuration} 
              onChange={setTimerDuration} 
            />

            <BarcodeImageUpload 
              image={barcodeImage} 
              onImageChange={setBarcodeImage} 
            />

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Simpan
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Memuat data produk...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
