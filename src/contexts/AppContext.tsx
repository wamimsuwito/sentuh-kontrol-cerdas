
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bluetoothService } from '../services/BluetoothService';
import { Capacitor } from '@capacitor/core';

interface AppState {
  currentScreen: 'home' | 'category' | 'confirm' | 'processing';
  selectedCategory: number | null;
  selectedOption: string | null;
  isBluetoothConnected: boolean;
  limitSwitchPressed: boolean;
  autoReturnTimer: NodeJS.Timeout | null;
  bluetoothStatus: 'connected' | 'disconnected' | 'unavailable' | 'connecting';
  error: string | null;
}

type AppAction = 
  | { type: 'SET_SCREEN'; payload: AppState['currentScreen'] }
  | { type: 'SET_CATEGORY'; payload: number }
  | { type: 'SET_OPTION'; payload: string }
  | { type: 'SET_BLUETOOTH_STATUS'; payload: boolean }
  | { type: 'SET_LIMIT_SWITCH'; payload: boolean }
  | { type: 'SET_AUTO_TIMER'; payload: NodeJS.Timeout | null }
  | { type: 'SET_BLUETOOTH_CONNECTION_STATUS'; payload: AppState['bluetoothStatus'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_HOME' };

const initialState: AppState = {
  currentScreen: 'home',
  selectedCategory: null,
  selectedOption: null,
  isBluetoothConnected: false,
  limitSwitchPressed: false,
  autoReturnTimer: null,
  bluetoothStatus: 'disconnected',
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_OPTION':
      return { ...state, selectedOption: action.payload };
    case 'SET_BLUETOOTH_STATUS':
      return { ...state, isBluetoothConnected: action.payload };
    case 'SET_LIMIT_SWITCH':
      return { ...state, limitSwitchPressed: action.payload };
    case 'SET_AUTO_TIMER':
      return { ...state, autoReturnTimer: action.payload };
    case 'SET_BLUETOOTH_CONNECTION_STATUS':
      return { ...state, bluetoothStatus: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_TO_HOME':
      return {
        ...state,
        currentScreen: 'home',
        selectedCategory: null,
        selectedOption: null,
        limitSwitchPressed: false,
        autoReturnTimer: null,
        error: null,
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  initializeBluetooth: () => Promise<void>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const initializeBluetooth = async () => {
    try {
      dispatch({ type: 'SET_BLUETOOTH_CONNECTION_STATUS', payload: 'connecting' });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!Capacitor.isNativePlatform()) {
        dispatch({ type: 'SET_BLUETOOTH_CONNECTION_STATUS', payload: 'unavailable' });
        dispatch({ type: 'SET_ERROR', payload: 'Bluetooth hanya tersedia di aplikasi Android native' });
        return;
      }

      await bluetoothService.initialize();
      await bluetoothService.scanAndConnect();
      
      dispatch({ type: 'SET_BLUETOOTH_STATUS', payload: true });
      dispatch({ type: 'SET_BLUETOOTH_CONNECTION_STATUS', payload: 'connected' });
    } catch (error) {
      console.error('Error inisialisasi Bluetooth:', error);
      dispatch({ type: 'SET_BLUETOOTH_STATUS', payload: false });
      dispatch({ type: 'SET_BLUETOOTH_CONNECTION_STATUS', payload: 'disconnected' });
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menghubungkan Bluetooth. Pastikan ESP32 aktif dan dalam jangkauan.' });
    }
  };

  useEffect(() => {
    // Listen untuk event limit switch
    const handleLimitSwitch = () => {
      dispatch({ type: 'SET_LIMIT_SWITCH', payload: true });
    };

    const handleBluetoothConnected = () => {
      dispatch({ type: 'SET_BLUETOOTH_STATUS', payload: true });
      dispatch({ type: 'SET_BLUETOOTH_CONNECTION_STATUS', payload: 'connected' });
      dispatch({ type: 'SET_ERROR', payload: null });
    };

    const handleBluetoothDisconnected = () => {
      dispatch({ type: 'SET_BLUETOOTH_STATUS', payload: false });
      dispatch({ type: 'SET_BLUETOOTH_CONNECTION_STATUS', payload: 'disconnected' });
    };

    window.addEventListener('limitSwitchPressed', handleLimitSwitch);
    window.addEventListener('bluetoothConnected', handleBluetoothConnected);
    window.addEventListener('bluetoothDisconnected', handleBluetoothDisconnected);

    return () => {
      window.removeEventListener('limitSwitchPressed', handleLimitSwitch);
      window.removeEventListener('bluetoothConnected', handleBluetoothConnected);
      window.removeEventListener('bluetoothDisconnected', handleBluetoothDisconnected);
      if (state.autoReturnTimer) {
        clearTimeout(state.autoReturnTimer);
      }
    };
  }, [state.autoReturnTimer]);

  return (
    <AppContext.Provider value={{ state, dispatch, initializeBluetooth }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp harus digunakan dalam AppProvider');
  }
  return context;
};
