
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface BarcodeImageUploadProps {
  image: string;
  onImageChange: (image: string) => void;
}

const BarcodeImageUpload = ({ image, onImageChange }: BarcodeImageUploadProps) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 Image upload triggered');
    const file = event.target.files?.[0];
    if (file) {
      console.log('📸 File selected:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('📸 Image loaded, setting state');
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    console.log('🖱️ Upload button clicked');
    const input = document.getElementById('barcodeImage') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  return (
    <div>
      <Label htmlFor="barcodeImage">Gambar Barcode</Label>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            id="barcodeImage"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Gambar Barcode
          </Button>
        </div>
        
        {image && (
          <div className="border rounded-lg p-2">
            <img 
              src={image} 
              alt="Barcode preview" 
              className="w-full h-24 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeImageUpload;
