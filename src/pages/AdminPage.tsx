
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCategorySettings } from '@/hooks/useCategorySettings';
import { useProductSettings } from '@/hooks/useProductSettings';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import ProductEditDialog from '@/components/ProductEditDialog';
import AdminHeader from '@/components/AdminPage/AdminHeader';
import CategoryList from '@/components/AdminPage/CategoryList';
import BarcodeDisplaySettings from '@/components/AdminPage/BarcodeDisplaySettings';
import { RelayItem } from '@/types/relay';

interface AdminPageProps {
  onBack: () => void;
}

const AdminPage = ({ onBack }: AdminPageProps) => {
  const { logout } = useAdminAuth();
  const { categorySettings, updateCategoryStatus } = useCategorySettings();
  const { productSettings, updateProductStatus } = useProductSettings();
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<RelayItem | null>(null);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari panel admin",
    });
    onBack();
  };

  const handleToggleCategory = (categoryId: string, categoryName: string) => {
    const newStatus = !categorySettings[categoryId];
    updateCategoryStatus(categoryId, newStatus);
    
    toast({
      title: `Kategori ${newStatus ? 'Diaktifkan' : 'Dinonaktifkan'}`,
      description: `${categoryName} telah ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
    });
  };

  const handleToggleProduct = (productId: string, productName: string) => {
    const newStatus = !productSettings[productId];
    updateProductStatus(productId, newStatus);
    
    toast({
      title: `Produk ${newStatus ? 'Diaktifkan' : 'Dinonaktifkan'}`,
      description: `${productName} telah ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditProduct = (product: RelayItem) => {
    setEditingProduct(product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="max-w-2xl mx-auto">
        <AdminHeader onLogout={handleLogout} />

        <div className="space-y-6">
          <CategoryList
            categorySettings={categorySettings}
            productSettings={productSettings}
            expandedCategories={expandedCategories}
            onToggleCategory={handleToggleCategory}
            onToggleExpansion={toggleCategoryExpansion}
            onToggleProduct={handleToggleProduct}
            onEditProduct={handleEditProduct}
          />

          <BarcodeDisplaySettings />
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full bg-white bg-opacity-10 text-white hover:bg-opacity-20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Aplikasi
          </Button>
        </div>
      </div>

      {/* Product Edit Dialog */}
      <ProductEditDialog
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
};

export default AdminPage;
