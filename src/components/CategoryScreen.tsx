
import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft } from 'lucide-react';

const categoryOptions = {
  1: [
    { name: 'Kopi Hitam', relay: 1 },
    { name: 'Kopi Susu', relay: 2 },
    { name: 'Cappuccino', relay: 3 },
    { name: 'Latte', relay: 4 },
  ],
  2: [
    { name: 'Es Teh', relay: 5 },
    { name: 'Es Jeruk', relay: 6 },
    { name: 'Es Kelapa', relay: 7 },
    { name: 'Jus Buah', relay: 8 },
  ],
  3: [
    { name: 'Keripik', relay: 9 },
    { name: 'Biskuit', relay: 10 },
    { name: 'Permen', relay: 11 },
    { name: 'Coklat', relay: 12 },
  ],
  4: [
    { name: 'Marlboro', relay: 13 },
    { name: 'Gudang Garam', relay: 14 },
    { name: 'Sampoerna', relay: 15 },
    { name: 'Djarum', relay: 16 },
  ],
};

const CategoryScreen: React.FC = () => {
  const { state, dispatch } = useApp();

  const options = state.selectedCategory ? categoryOptions[state.selectedCategory as keyof typeof categoryOptions] : [];

  const handleOptionSelect = (option: string, relayNumber: number) => {
    dispatch({ type: 'SET_OPTION', payload: option });
    dispatch({ type: 'SET_SCREEN', payload: 'confirm' });
    
    // Clear auto return timer
    if (state.autoReturnTimer) {
      clearTimeout(state.autoReturnTimer);
      dispatch({ type: 'SET_AUTO_TIMER', payload: null });
    }
  };

  const handleBack = () => {
    // Clear timer
    if (state.autoReturnTimer) {
      clearTimeout(state.autoReturnTimer);
    }
    dispatch({ type: 'RESET_TO_HOME' });
  };

  const getCategoryName = () => {
    const categories = ['Aneka Kopi', 'Minuman Dingin', 'Makanan Ringan', 'Rokok Ketengah'];
    return state.selectedCategory ? categories[state.selectedCategory - 1] : '';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-800/20"></div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-blue-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Category Title */}
        <div className="futuristic-card p-6 mb-8 text-center">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-3xl font-bold neon-glow mb-2">{getCategoryName()}</h1>
          <p className="text-gray-300">Pilih salah satu opsi:</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option.name, option.relay)}
              className="futuristic-button min-h-[100px] flex items-center justify-center text-xl font-semibold"
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* Auto return timer indicator */}
        <div className="mt-8 glass-morphism p-4 rounded-xl">
          <div className="text-center text-sm text-gray-400 mb-2">
            Otomatis kembali dalam 15 detik jika tidak ada pilihan
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="progress-bar w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryScreen;
