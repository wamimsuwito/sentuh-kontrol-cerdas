
export class ArduinoService {
  private port: SerialPort | null = null;
  private isConnected = false;

  async initialize(): Promise<void> {
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API tidak didukung di browser ini. Gunakan Chrome/Edge terbaru.');
      }

      console.log('Arduino Serial Service berhasil diinisialisasi');
    } catch (error) {
      console.error('Error saat inisialisasi Arduino Serial:', error);
      throw error;
    }
  }

  async scanAndConnect(): Promise<void> {
    try {
      console.log('Mencoba menghubungkan ke Arduino Mega 2560...');
      
      // Request a port and open a connection
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      
      this.isConnected = true;
      console.log('Berhasil terhubung ke Arduino Mega 2560');

      // Setup reader for incoming data
      this.setupReader();

      // Emit connected event
      window.dispatchEvent(new CustomEvent('arduinoConnected'));
    } catch (error) {
      console.error('Error saat menghubungkan ke Arduino:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async setupReader(): Promise<void> {
    if (!this.port || !this.port.readable) return;

    const reader = this.port.readable.getReader();
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Convert Uint8Array to string
        const message = new TextDecoder().decode(value);
        console.log('Data dari Arduino:', message);
        
        // Check for limit switch signal
        if (message.includes('LIMIT_SWITCH_PRESSED')) {
          window.dispatchEvent(new CustomEvent('limitSwitchPressed', { 
            detail: { message } 
          }));
        }
      }
    } catch (error) {
      console.error('Error membaca data dari Arduino:', error);
    } finally {
      reader.releaseLock();
    }
  }

  async sendRelayCommand(relayNumber: number, action: 'ON' | 'OFF'): Promise<void> {
    if (!this.port || !this.isConnected) {
      throw new Error('Arduino tidak terhubung');
    }

    try {
      const command = `RELAY_${relayNumber}_${action}\n`;
      const writer = this.port.writable?.getWriter();
      
      if (writer) {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(command));
        writer.releaseLock();
        
        console.log(`Perintah dikirim ke Arduino: ${command.trim()}`);
      }
    } catch (error) {
      console.error('Error saat mengirim perintah ke Arduino:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
        this.isConnected = false;
        console.log('Arduino terputus');
        
        // Emit disconnected event
        window.dispatchEvent(new CustomEvent('arduinoDisconnected'));
      } catch (error) {
        console.error('Error saat memutus koneksi Arduino:', error);
      }
    }
  }

  isPortConnected(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'unavailable' {
    if (!('serial' in navigator)) {
      return 'unavailable';
    }
    return this.isConnected ? 'connected' : 'disconnected';
  }
}

export const arduinoService = new ArduinoService();
