
import React from 'react';
import { useApp } from '../contexts/AppContext';

const ConfirmScreen: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'RESET_TO_HOME' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'processing' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-cyan-800/20"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="futuristic-card p-8 text-center">
          {/* Refresh Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold neon-glow mb-4">
            Silakan scan barcode untuk melanjutkan
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
            <div className="progress-bar w-3/4"></div>
          </div>

          <p className="text-gray-300 mb-8">
            Menunggu sinyal dari perangkat
          </p>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
            >
              Kembali
            </button>
            
            <button
              onClick={handleContinue}
              disabled={!state.limitSwitchPressed}
              className={`flex-1 font-semibold py-4 px-6 rounded-xl transition-all duration-300 ${
                state.limitSwitchPressed
                  ? 'futuristic-button'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Lanjut →
            </button>
          </div>

          {/* Status indicator */}
          <div className="mt-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              state.limitSwitchPressed
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            }`}>
              {state.limitSwitchPressed ? '✅ Sinyal diterima' : '⏳ Menunggu sinyal...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmScreen;
