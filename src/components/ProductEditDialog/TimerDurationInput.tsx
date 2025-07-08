
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimerDurationInputProps {
  value: number;
  onChange: (value: number) => void;
}

const TimerDurationInput = ({ value, onChange }: TimerDurationInputProps) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    console.log('⏱️ Timer input change:', inputValue);
    
    setLocalValue(inputValue);
    
    if (inputValue === '') {
      return;
    }
    
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 120) {
      console.log('⏱️ Valid timer duration, updating parent:', newValue);
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    console.log('⏱️ Timer input blur, current value:', localValue);
    const numValue = parseInt(localValue);
    
    if (localValue === '' || isNaN(numValue) || numValue < 1 || numValue > 120) {
      console.log('⏱️ Invalid input on blur, resetting to:', value);
      setLocalValue(value.toString());
    }
  };

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const inputValue = target.value;
    console.log('⏱️ Timer input event (Android):', inputValue);
    
    setLocalValue(inputValue);
    
    if (inputValue !== '') {
      const newValue = parseInt(inputValue);
      if (!isNaN(newValue) && newValue >= 1 && newValue <= 120) {
        onChange(newValue);
      }
    }
  };

  return (
    <div>
      <Label htmlFor="timerDuration">Durasi Timer Relay (detik)</Label>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-blue-600" />
          <Input
            id="timerDuration"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            max="120"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onInput={handleInput}
            placeholder="Durasi dalam detik"
            className="w-full"
            autoComplete="off"
          />
        </div>
        <p className="text-sm text-gray-600">
          Relay akan aktif selama {value} detik untuk mengeluarkan produk (maksimal 120 detik)
        </p>
      </div>
    </div>
  );
};

export default TimerDurationInput;
