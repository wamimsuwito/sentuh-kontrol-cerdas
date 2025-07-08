
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ProductNameInput = ({ value, onChange }: ProductNameInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log('📝 Product name change triggered:', newValue);
    onChange(newValue);
  };

  return (
    <div>
      <Label htmlFor="productName">Nama Produk</Label>
      <Input
        id="productName"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Masukkan nama produk"
        autoComplete="off"
        maxLength={50}
      />
    </div>
  );
};

export default ProductNameInput;
