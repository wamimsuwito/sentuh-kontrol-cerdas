
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel Admin</h1>
            <p className="text-gray-600">Kelola pengaturan kategori dan produk vending machine</p>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
