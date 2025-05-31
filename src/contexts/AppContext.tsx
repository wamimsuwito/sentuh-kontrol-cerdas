
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bluetoothService } from '../services/BluetoothService';

interface AppState {
  currentScreen: 'home' | 'category' | 'confirm' | 'processing';
  selectedCategory: number | null;
  selectedOption: string | null;
  isBluetoothConnected: boolean;
  limitSwitchPressed: boolean;
  autoReturnTimer: NodeJS.Timeout | null;
}

type AppAction = 
  | { type: 'SET_SCREEN'; payload: AppState['currentScreen'] }
  | { type: 'SET_CATEGORY'; payload: number }
  | { type: 'SET_OPTION'; payload: string }
  | { type: 'SET_BLUETOOTH_STATUS'; payload: boolean }
  | { type: 'SET_LIMIT_SWITCH'; payload: boolean }
  | { type: 'SET_AUTO_TIMER'; payload: NodeJS.Timeout | null }
  | { type: 'RESET_TO_HOME' };

const initialState: AppState = {
  currentScreen: 'home',
  selectedCategory: null,
  selectedOption: null,
  isBluetoothConnected: false,
  limitSwitchPressed: false,
  autoReturnTimer: null,
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
    case 'RESET_TO_HOME':
      return {
        ...state,
        currentScreen: 'home',
        selectedCategory: null,
        selectedOption: null,
        limitSwitchPressed: false,
        autoReturnTimer: null,
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Inisialisasi Bluetooth
    const initBluetooth = async () => {
      try {
        await bluetoothService.initialize();
        await bluetoothService.scanAndConnect();
        dispatch({ type: 'SET_BLUETOOTH_STATUS', payload: true });
      } catch (error) {
        console.error('Error inisialisasi Bluetooth:', error);
      }
    };

    initBluetooth();

    // Listen untuk event limit switch
    const handleLimitSwitch = () => {
      dispatch({ type: 'SET_LIMIT_SWITCH', payload: true });
    };

    window.addEventListener('limitSwitchPressed', handleLimitSwitch);

    return () => {
      window.removeEventListener('limitSwitchPressed', handleLimitSwitch);
      if (state.autoReturnTimer) {
        clearTimeout(state.autoReturnTimer);
      }
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
