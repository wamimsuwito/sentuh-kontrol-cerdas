
import { useESP32BluetoothNative } from "@/hooks/useESP32BluetoothNative";
import { useProductSettings } from "@/hooks/useProductSettings";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { useConnectionFlow } from "@/hooks/useConnectionFlow";
import { useOrderFlow } from "@/hooks/useOrderFlow";
import { useAdminFlow } from "@/hooks/useAdminFlow";
import { useAudioManager } from "@/hooks/useAudioManager";
import { useEffect } from "react";
import CategoryPage from "./CategoryPage";
import ConfirmationPage from "./ConfirmationPage";
import ProcessingPage from "./ProcessingPage";
import ConnectionPage from "./ConnectionPage";
import HomePage from "./HomePage";
import AdminLoginPage from "./AdminLoginPage";
import AdminPage from "./AdminPage";

const Index = () => {
  const {
    currentPage,
    selectedCategory,
    selectedItem,
    navigateToPage,
    handleCategorySelect,
    handleItemSelect,
    handleBack,
    resetToHome
  } = usePageNavigation();

  const { 
    isConnected, 
    isConnecting, 
    limitSwitchPressed, 
    buttonEnabled,
    connectToESP32,
    disconnect,
    activateRelay,
    handleButtonPress,
    setButtonTimeout,
    cancelCountdown,
    isNative
  } = useESP32BluetoothNative();

  const { isProductEnabled } = useProductSettings();
  const { stopAllAudio } = useAudioManager();

  const { handleConnect, handleDisconnect } = useConnectionFlow({
    isNative,
    connectToESP32,
    disconnect,
    onConnectionSuccess: () => navigateToPage("home"),
    onDisconnectionSuccess: () => navigateToPage("connection")
  });

  const { handleAdminClick, handleAdminLoginSuccess } = useAdminFlow({
    onAdminPageOpen: () => navigateToPage("admin"),
    onAdminLoginOpen: () => navigateToPage("admin-login")
  });

  const { startOrderTimeout, handleConfirm, handleProcessingComplete, handleCancelOrder } = useOrderFlow({
    selectedItem,
    buttonEnabled,
    activateRelay,
    handleButtonPress,
    setButtonTimeout,
    cancelCountdown,
    onProcessingStart: () => navigateToPage("processing"),
    onOrderComplete: resetToHome,
    onOrderCancel: resetToHome
  });

  // Stop all audio when navigating to home page
  useEffect(() => {
    if (currentPage === "home") {
      console.log('🔇 Navigating to home page - stopping all audio');
      stopAllAudio();
    }
  }, [currentPage, stopAllAudio]);

  // Start timeout when item is selected
  const handleItemSelectWithTimeout = (item: any) => {
    handleItemSelect(item);
    startOrderTimeout();
  };

  // Enhanced back handler that stops all audio
  const handleBackWithAudioStop = () => {
    console.log('🔇 Back button pressed - stopping all audio');
    stopAllAudio();
    handleBack();
  };

  // Enhanced reset to home that stops all audio
  const resetToHomeWithAudioStop = () => {
    console.log('🔇 Resetting to home - stopping all audio');
    stopAllAudio();
    resetToHome();
  };

  // Admin login page
  if (currentPage === "admin-login") {
    return (
      <AdminLoginPage
        onBack={handleBackWithAudioStop}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // Admin page
  if (currentPage === "admin") {
    return (
      <AdminPage onBack={handleBackWithAudioStop} />
    );
  }

  // Connection page
  if (!isConnected || currentPage === "connection") {
    return (
      <ConnectionPage onConnect={handleConnect} isConnecting={isConnecting} />
    );
  }

  // Category page
  if (currentPage === "category" && selectedCategory) {
    return (
      <CategoryPage
        category={selectedCategory}
        onItemSelect={handleItemSelectWithTimeout}
        onBack={handleBackWithAudioStop}
        isProductEnabled={isProductEnabled}
      />
    );
  }

  // Confirmation page
  if (currentPage === "confirmation" && selectedItem) {
    return (
      <ConfirmationPage
        item={selectedItem}
        onBack={() => {
          handleCancelOrder();
          handleBackWithAudioStop();
        }}
        onConfirm={handleConfirm}
        limitSwitchPressed={limitSwitchPressed}
        buttonEnabled={buttonEnabled}
        onCancelCountdown={cancelCountdown}
      />
    );
  }

  // Processing page
  if (currentPage === "processing" && selectedItem) {
    return (
      <ProcessingPage
        item={selectedItem}
        onComplete={handleProcessingComplete}
        limitSwitchPressed={limitSwitchPressed}
      />
    );
  }

  // Home page
  return (
    <HomePage
      isConnected={isConnected}
      onDisconnect={handleDisconnect}
      onCategorySelect={handleCategorySelect}
      onAdminClick={handleAdminClick}
    />
  );
};

export default Index;
