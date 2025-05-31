
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Bluetooth, RefreshCw } from 'lucide-react';

const categories = [
  { id: 1, name: 'Aneka Kopi', emoji: '☕', color: 'from-amber-600 to-orange-600' },
  { id: 2, name: 'Minuman Dingin', emoji: '🥤', color: 'from-cyan-600 to-blue-600' },
  { id: 3, name: 'Makanan Ringan', emoji: '🍟', color: 'from-yellow-600 to-red-600' },
  { id: 4, name: 'Rokok Ketengah', emoji: '🚬', color: 'from-gray-600 to-slate-600' },
];

const HomeScreen: React.FC = () => {
  const { state, dispatch, initializeBluetooth } = useApp();

  const handleCategorySelect = (categoryId: number) => {
    if (state.bluetoothStatus !== 'connected') {
      dispatch({ type: 'SET_ERROR', payload: 'Hubungkan Bluetooth terlebih dahulu' });
      return;
    }

    dispatch({ type: 'SET_CATEGORY', payload: categoryId });
    dispatch({ type: 'SET_SCREEN', payload: 'category' });

    // Set auto return timer untuk 15 detik
    const timer = setTimeout(() => {
      dispatch({ type: 'RESET_TO_HOME' });
    }, 15000);
    
    dispatch({ type: 'SET_AUTO_TIMER', payload: timer });
  };

  const handleBluetoothConnect = async () => {
    await initializeBluetooth();
  };

  const getBluetoothStatusText = () => {
    switch (state.bluetoothStatus) {
      case 'connected':
        return '🟢 Bluetooth Terhubung';
      case 'connecting':
        return '🟡 Menghubungkan...';
      case 'unavailable':
        return '🔴 Bluetooth Tidak Tersedia (Web Mode)';
      default:
        return '🔴 Bluetooth Terputus';
    }
  };

  const getBluetoothStatusColor = () => {
    switch (state.bluetoothStatus) {
      case 'connected':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'connecting':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'unavailable':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-800/20"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="futuristic-card p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold neon-glow mb-4">
            Selamat Datang di
          </h1>
          <h2 className="text-5xl font-bold text-white mb-2">
            Nice Ningrum
          </h2>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        </div>

        {/* Bluetooth Status & Control */}
        <div className="futuristic-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getBluetoothStatusColor()}`}>
              <Bluetooth className="mr-2" size={16} />
              {getBluetoothStatusText()}
            </div>
            
            <button
              onClick={handleBluetoothConnect}
              disabled={state.bluetoothStatus === 'connecting' || state.bluetoothStatus === 'unavailable'}
              className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                state.bluetoothStatus === 'connecting' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : state.bluetoothStatus === 'unavailable'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'futuristic-button'
              }`}
            >
              <RefreshCw className={`mr-2 ${state.bluetoothStatus === 'connecting' ? 'animate-spin' : ''}`} size={16} />
              {state.bluetoothStatus === 'connecting' ? 'Menghubungkan...' : 'Hubungkan'}
            </button>
          </div>

          {state.error && (
            <div className="bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg p-3 text-sm">
              {state.error}
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="glass-morphism p-6 rounded-2xl">
          <p className="text-center text-xl text-gray-300 mb-8">
            Pilih kategori di bawah untuk melanjutkan
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`futuristic-button bg-gradient-to-r ${category.color} hover:scale-110 transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center space-y-3 ${
                  state.bluetoothStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={state.bluetoothStatus !== 'connected'}
              >
                <span className="text-4xl">{category.emoji}</span>
                <span className="text-lg font-semibold text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-400">
          <p className="text-sm">
            {state.bluetoothStatus === 'unavailable' 
              ? 'Install aplikasi di Android untuk menggunakan Bluetooth'
              : 'Pastikan ESP32 aktif dan dalam jangkauan Bluetooth'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
