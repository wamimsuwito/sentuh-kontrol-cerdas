import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Capacitor } from '@capacitor/core';
interface ConnectionPageProps {
  onConnect: () => void;
  isConnecting: boolean;
}
const ConnectionPage = ({
  onConnect,
  isConnecting
}: ConnectionPageProps) => {
  const isNative = Capacitor.isNativePlatform();
  return <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">NiceNingrum</CardTitle>
          <p className="text-gray-600">Vending machine control</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📱</span>
            </div>
            <p className="text-gray-600 mb-6">Perlu Sambungkan BLE</p>
          </div>
          
          <Button onClick={onConnect} disabled={isConnecting} className="w-full bg-blue-500 hover:bg-blue-600">
            {isConnecting ? "Menghubungkan..." : "Hubungkan ESP32"}
          </Button>
          
          <div className="text-sm text-gray-500 text-center space-y-2">
            <p className="font-semibold text-blue-600">Langkah-langkah:</p>
            <div className="text-left space-y-1">
              <p>1. Upload kode BLE ke ESP32</p>
              <p>2. Nyalakan ESP32 dan tunggu hingga siap</p>
              <p>3. Aktifkan Bluetooth di perangkat Anda</p>
              <p>4. Klik tombol "Hubungkan ESP32"</p>
              <p>5. Pilih "ESP32_Relay_Controller" dari daftar BLE</p>
            </div>
            <div className="mt-4 space-y-2">
              <p className={`font-medium ${isNative ? 'text-green-600' : 'text-blue-600'}`}>
                {isNative ? '✅ Mode: Android Native App' : '📱 Mode: Web Browser'}
              </p>
              <p className="text-green-600 font-medium">
                ✅ Menggunakan Bluetooth Low Energy (BLE)
              </p>
              {!isNative && <p className="text-orange-600">
                  ⚠️ Browser harus mendukung Web Bluetooth (Chrome/Edge)
                </p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default ConnectionPage;