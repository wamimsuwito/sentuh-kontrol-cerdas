
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Usb, RefreshCw } from 'lucide-react';

const categories = [
  { id: 1, name: 'Aneka Kopi', emoji: '☕', color: 'from-amber-600 to-orange-600' },
  { id: 2, name: 'Minuman Dingin', emoji: '🥤', color: 'from-cyan-600 to-blue-600' },
  { id: 3, name: 'Makanan Ringan', emoji: '🍟', color: 'from-yellow-600 to-red-600' },
  { id: 4, name: 'Rokok Ketengah', emoji: '🚬', color: 'from-gray-600 to-slate-600' },
];

const HomeScreen: React.FC = () => {
  const { state, dispatch, initializeArduino } = useApp();

  const handleCategorySelect = (categoryId: number) => {
    if (state.arduinoStatus !== 'connected') {
      dispatch({ type: 'SET_ERROR', payload: 'Mohon maaf, untuk sementara mesin ini tidak dapat digunakan' });
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

  const handleArduinoConnect = async () => {
    await initializeArduino();
  };

  const getArduinoStatusText = () => {
    switch (state.arduinoStatus) {
      case 'connected':
        return '🟢 Arduino Terhubung';
      case 'connecting':
        return '🟡 Menghubungkan...';
      case 'unavailable':
        return '🔴 Web Serial Tidak Tersedia';
      default:
        return '🔴 Arduino Terputus';
    }
  };

  const getArduinoStatusColor = () => {
    switch (state.arduinoStatus) {
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-800/20"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>

      {/* Twinkling Stars */}
      <div className="stars-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content - Takes most of the space */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="futuristic-card p-8 mb-8 text-center relative">
            <h1 className="text-3xl font-bold neon-glow mb-4">
              Selamat Datang di
            </h1>
            <h2 className="text-3xl font-bold text-white mb-2 blinking-smooth">
              NiceNingrum
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
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
                    state.arduinoStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={state.arduinoStatus !== 'connected'}
                >
                  <span className="text-4xl">{category.emoji}</span>
                  <span className="text-lg font-semibold text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Arduino Connection Status - Fixed at bottom */}
      <div className="relative z-10 p-4 bg-gradient-to-t from-gray-900/90 to-transparent backdrop-blur-sm">
        <div className="w-full max-w-2xl mx-auto">
          {/* Arduino Status Display */}
          <div className="flex items-center justify-center mb-4">
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getArduinoStatusColor()}`}>
              <Usb className="mr-2" size={16} />
              {getArduinoStatusText()}
            </div>
          </div>

          {/* Error Message - Only show when there's an error AND Arduino is not connected */}
          {state.error && state.arduinoStatus !== 'connected' && (
            <div className="bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg p-3 text-sm text-center mb-4">
              {state.error}
            </div>
          )}

          {/* Arduino Connection Control */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleArduinoConnect}
              disabled={state.arduinoStatus === 'connecting' || state.arduinoStatus === 'unavailable'}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                state.arduinoStatus === 'connecting' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : state.arduinoStatus === 'unavailable'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'futuristic-button'
              }`}
            >
              <RefreshCw className={`mr-2 ${state.arduinoStatus === 'connecting' ? 'animate-spin' : ''}`} size={20} />
              {state.arduinoStatus === 'connecting' ? 'Menghubungkan...' : 'Hubungkan Arduino'}
            </button>
            
            <p className="text-center text-xs text-gray-400">
              {state.arduinoStatus === 'unavailable' 
                ? 'Gunakan browser Chrome/Edge untuk koneksi USB'
                : 'Pastikan Arduino Mega 2560 terhubung via USB'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
