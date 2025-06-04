
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { arduinoService } from '../services/ArduinoService';

interface AppState {
  currentScreen: 'home' | 'category' | 'confirm' | 'processing';
  selectedCategory: number | null;
  selectedOption: string | null;
  isArduinoConnected: boolean;
  limitSwitchPressed: boolean;
  autoReturnTimer: NodeJS.Timeout | null;
  arduinoStatus: 'connected' | 'disconnected' | 'unavailable' | 'connecting';
  error: string | null;
}

type AppAction = 
  | { type: 'SET_SCREEN'; payload: AppState['currentScreen'] }
  | { type: 'SET_CATEGORY'; payload: number }
  | { type: 'SET_OPTION'; payload: string }
  | { type: 'SET_ARDUINO_STATUS'; payload: boolean }
  | { type: 'SET_LIMIT_SWITCH'; payload: boolean }
  | { type: 'SET_AUTO_TIMER'; payload: NodeJS.Timeout | null }
  | { type: 'SET_ARDUINO_CONNECTION_STATUS'; payload: AppState['arduinoStatus'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_HOME' };

const initialState: AppState = {
  currentScreen: 'home',
  selectedCategory: null,
  selectedOption: null,
  isArduinoConnected: false,
  limitSwitchPressed: false,
  autoReturnTimer: null,
  arduinoStatus: 'disconnected',
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
    case 'SET_ARDUINO_STATUS':
      return { ...state, isArduinoConnected: action.payload };
    case 'SET_LIMIT_SWITCH':
      return { ...state, limitSwitchPressed: action.payload };
    case 'SET_AUTO_TIMER':
      return { ...state, autoReturnTimer: action.payload };
    case 'SET_ARDUINO_CONNECTION_STATUS':
      return { ...state, arduinoStatus: action.payload };
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
  initializeArduino: () => Promise<void>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const initializeArduino = async () => {
    try {
      dispatch({ type: 'SET_ARDUINO_CONNECTION_STATUS', payload: 'connecting' });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!('serial' in navigator)) {
        dispatch({ type: 'SET_ARDUINO_CONNECTION_STATUS', payload: 'unavailable' });
        dispatch({ type: 'SET_ERROR', payload: 'Web Serial API tidak didukung. Gunakan Chrome/Edge terbaru.' });
        return;
      }

      await arduinoService.initialize();
      await arduinoService.scanAndConnect();
      
      dispatch({ type: 'SET_ARDUINO_STATUS', payload: true });
      dispatch({ type: 'SET_ARDUINO_CONNECTION_STATUS', payload: 'connected' });
    } catch (error) {
      console.error('Error inisialisasi Arduino:', error);
      dispatch({ type: 'SET_ARDUINO_STATUS', payload: false });
      dispatch({ type: 'SET_ARDUINO_CONNECTION_STATUS', payload: 'disconnected' });
      dispatch({ type: 'SET_ERROR', payload: 'Gagal menghubungkan Arduino. Pastikan kabel USB terhubung dan driver terinstall.' });
    }
  };

  useEffect(() => {
    // Listen untuk event limit switch dan Arduino connection
    const handleLimitSwitch = () => {
      dispatch({ type: 'SET_LIMIT_SWITCH', payload: true });
    };

    const handleArduinoConnected = () => {
      dispatch({ type: 'SET_ARDUINO_STATUS', payload: true });
      dispatch({ type: 'SET_ARDUINO_CONNECTION_STATUS', payload: 'connected' });
      dispatch({ type: 'SET_ERROR', payload: null });
    };

    const handleArduinoDisconnected = () => {
      dispatch({ type: 'SET_ARDUINO_STATUS', payload: false });
      dispatch({ type: 'SET_ARDUINO_CONNECTION_STATUS', payload: 'disconnected' });
    };

    window.addEventListener('limitSwitchPressed', handleLimitSwitch);
    window.addEventListener('arduinoConnected', handleArduinoConnected);
    window.addEventListener('arduinoDisconnected', handleArduinoDisconnected);

    return () => {
      window.removeEventListener('limitSwitchPressed', handleLimitSwitch);
      window.removeEventListener('arduinoConnected', handleArduinoConnected);
      window.removeEventListener('arduinoDisconnected', handleArduinoDisconnected);
      if (state.autoReturnTimer) {
        clearTimeout(state.autoReturnTimer);
      }
    };
  }, [state.autoReturnTimer]);

  return (
    <AppContext.Provider value={{ state, dispatch, initializeArduino }}>
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
