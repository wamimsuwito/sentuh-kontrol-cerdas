
import React from 'react';
import { useApp } from '../contexts/AppContext';
import HomeScreen from '../components/HomeScreen';
import CategoryScreen from '../components/CategoryScreen';
import ConfirmScreen from '../components/ConfirmScreen';
import ProcessingScreen from '../components/ProcessingScreen';

const Index = () => {
  const { state } = useApp();

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'category':
        return <CategoryScreen />;
      case 'confirm':
        return <ConfirmScreen />;
      case 'processing':
        return <ProcessingScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default Index;
