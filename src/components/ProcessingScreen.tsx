
import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { arduinoService } from '../services/ArduinoService';

const ProcessingScreen: React.FC = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Kirim perintah ke relay yang dipilih
    const sendRelayCommand = async () => {
      if (state.selectedCategory && state.selectedOption) {
        try {
          // Tentukan nomor relay berdasarkan kategori dan opsi
          const relayMap = {
            1: { 'Kopi Hitam': 1, 'Kopi Susu': 2, 'Cappuccino': 3, 'Latte': 4 },
            2: { 'Es Teh': 5, 'Es Jeruk': 6, 'Es Kelapa': 7, 'Jus Buah': 8 },
            3: { 'Keripik': 9, 'Biskuit': 10, 'Permen': 11, 'Coklat': 12 },
            4: { 'Marlboro': 13, 'Gudang Garam': 14, 'Sampoerna': 15, 'Djarum': 16 }
          };

          const categoryMap = relayMap[state.selectedCategory as keyof typeof relayMap];
          const relayNumber = categoryMap[state.selectedOption as keyof typeof categoryMap];

          if (relayNumber) {
            await arduinoService.sendRelayCommand(relayNumber, 'ON');
            console.log(`Relay ${relayNumber} dihidupkan untuk ${state.selectedOption}`);

            // Matikan relay setelah 5 detik
            setTimeout(async () => {
              await arduinoService.sendRelayCommand(relayNumber, 'OFF');
              console.log(`Relay ${relayNumber} dimatikan`);
            }, 5000);
          }
        } catch (error) {
          console.error('Error mengirim perintah relay:', error);
        }
      }
    };

    sendRelayCommand();

    // Auto return ke home setelah 8 detik
    const timer = setTimeout(() => {
      dispatch({ type: 'RESET_TO_HOME' });
    }, 8000);

    return () => clearTimeout(timer);
  }, [state.selectedCategory, state.selectedOption, dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-800/20"></div>
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="futuristic-card p-8 text-center">
          {/* Loading gear icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L21.5 6.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694L12 20.689l7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold blinking-text neon-glow mb-6">
            Pesanan anda sedang diproses, mohon tunggu yaa
          </h1>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Order details */}
          <div className="glass-morphism p-4 rounded-xl mb-6">
            <p className="text-lg font-semibold text-blue-300">
              {state.selectedOption}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Arduino Mega 2560 - USB
            </p>
          </div>

          {/* Status */}
          <p className="text-gray-300 text-sm">
            Proses akan selesai dalam beberapa detik...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
