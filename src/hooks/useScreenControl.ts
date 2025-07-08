
import { useCallback } from 'react';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export const useScreenControl = () => {
  const wakeScreen = useCallback(async () => {
    try {
      console.log('🔆 Mencoba menghidupkan layar...');
      
      if (Capacitor.isNativePlatform()) {
        // Untuk platform native Android
        console.log('📱 Platform native terdeteksi, menggunakan Device plugin');
        
        // Menggunakan Device.getInfo() untuk memastikan device aktif
        const info = await Device.getInfo();
        console.log('📋 Device info:', info);
        
        // Trigger screen wake dengan cara meminta permission atau akses device
        // Ini akan secara otomatis menghidupkan layar jika aplikasi mendapat fokus
        if ('wakeLock' in navigator) {
          try {
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            console.log('✅ Screen wake lock acquired');
            
            // Release setelah 5 detik agar tidak menguras baterai
            setTimeout(() => {
              wakeLock.release();
              console.log('🔓 Screen wake lock released');
            }, 5000);
          } catch (wakeLockError) {
            console.log('⚠️ Wake lock not available:', wakeLockError);
          }
        }
        
        // Alternatif: Menggunakan window focus untuk memastikan app aktif
        if (document.hidden) {
          console.log('📱 App sedang hidden, mencoba bring to front');
          window.focus();
          
          // Trigger visibility change event
          const event = new Event('visibilitychange');
          document.dispatchEvent(event);
        }
        
        return true;
      } else {
        // Untuk web browser
        console.log('🌐 Platform web terdeteksi');
        
        // Fokus ke window browser
        window.focus();
        
        // Coba request wake lock jika tersedia
        if ('wakeLock' in navigator) {
          try {
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            console.log('✅ Browser screen wake lock acquired');
            
            setTimeout(() => {
              wakeLock.release();
              console.log('🔓 Browser screen wake lock released');
            }, 5000);
          } catch (wakeLockError) {
            console.log('⚠️ Browser wake lock not available:', wakeLockError);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ Error saat menghidupkan layar:', error);
      return false;
    }
  }, []);

  const keepScreenOn = useCallback(async (duration: number = 30000) => {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log(`✅ Screen akan tetap hidup selama ${duration/1000} detik`);
        
        setTimeout(() => {
          wakeLock.release();
          console.log('🔓 Keep screen on released');
        }, duration);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error keep screen on:', error);
      return false;
    }
  }, []);

  return {
    wakeScreen,
    keepScreenOn
  };
};
