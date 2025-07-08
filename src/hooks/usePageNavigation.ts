
import { useState } from 'react';
import { RelayCategory, RelayItem } from '@/types/relay';

type Page = "connection" | "home" | "category" | "confirmation" | "processing" | "admin-login" | "admin";

export const usePageNavigation = () => {
  const [currentPage, setCurrentPage] = useState<Page>("connection");
  const [selectedCategory, setSelectedCategory] = useState<RelayCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<RelayItem | null>(null);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const handleCategorySelect = (category: RelayCategory) => {
    setSelectedCategory(category);
    setCurrentPage("category");
  };

  const handleItemSelect = (item: RelayItem) => {
    setSelectedItem(item);
    setCurrentPage("confirmation");
  };

  const handleBack = () => {
    switch (currentPage) {
      case "category":
        setCurrentPage("home");
        setSelectedCategory(null);
        break;
      case "confirmation":
        setCurrentPage("category");
        setSelectedItem(null);
        break;
      case "processing":
        setCurrentPage("home");
        setSelectedCategory(null);
        setSelectedItem(null);
        break;
      case "admin-login":
      case "admin":
        setCurrentPage("home");
        break;
    }
  };

  const resetToHome = () => {
    setCurrentPage("home");
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  return {
    currentPage,
    selectedCategory,
    selectedItem,
    navigateToPage,
    handleCategorySelect,
    handleItemSelect,
    handleBack,
    resetToHome
  };
};
