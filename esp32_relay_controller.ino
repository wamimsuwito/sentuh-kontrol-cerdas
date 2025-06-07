
#include "BluetoothSerial.h"

// Inisialisasi Bluetooth Serial
BluetoothSerial SerialBT;

// Pin untuk 16 relay (GPIO pins)
const int relayPins[16] = {2, 4, 5, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 12, 14, 15};

// Pin untuk limit switch
const int limitSwitchPin = 13;

// Pin untuk LED indikator
const int ledPin = 2;

// Variabel untuk status relay
bool relayStates[16] = {false};

// Variabel untuk limit switch
bool lastLimitSwitchState = false;
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;

void setup() {
  // Inisialisasi Serial untuk debugging
  Serial.begin(115200);
  
  // Inisialisasi Bluetooth dengan nama perangkat
  SerialBT.begin("ESP32_Relay_Controller"); // Nama yang akan terlihat saat scan
  Serial.println("ESP32 Relay Controller siap! Dapat dipasangkan dengan Bluetooth...");
  
  // Setup pin relay sebagai output
  for (int i = 0; i < 16; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW); // Matikan semua relay saat startup
  }
  
  // Setup pin limit switch sebagai input dengan pull-up internal
  pinMode(limitSwitchPin, INPUT_PULLUP);
  
  // Setup LED indikator
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  Serial.println("ESP32 Relay Controller berhasil diinisialisasi");
  Serial.println("16 Relay: Pin 2, 4, 5, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 12, 14, 15");
  Serial.println("Limit Switch: Pin 13");
  Serial.println("LED Indikator: Pin 2");
}

void loop() {
  // Cek koneksi Bluetooth
  if (SerialBT.hasClient()) {
    digitalWrite(ledPin, HIGH); // LED nyala jika ada client terhubung
  } else {
    digitalWrite(ledPin, LOW);  // LED mati jika tidak ada client
  }
  
  // Baca perintah dari Bluetooth
  if (SerialBT.available()) {
    String command = SerialBT.readString();
    command.trim(); // Hapus whitespace
    
    Serial.println("Perintah diterima: " + command);
    processCommand(command);
  }
  
  // Cek status limit switch
  checkLimitSwitch();
  
  // Kirim status secara berkala (setiap 5 detik)
  static unsigned long lastStatusTime = 0;
  if (millis() - lastStatusTime > 5000) {
    sendStatus();
    lastStatusTime = millis();
  }
  
  delay(10); // Delay kecil untuk stabilitas
}

void processCommand(String command) {
  // Format perintah: RELAY_X_ON atau RELAY_X_OFF
  // Dimana X adalah nomor relay (1-16)
  
  if (command.startsWith("RELAY_")) {
    int firstUnderscore = command.indexOf('_');
    int secondUnderscore = command.indexOf('_', firstUnderscore + 1);
    
    if (firstUnderscore != -1 && secondUnderscore != -1) {
      String relayNumStr = command.substring(firstUnderscore + 1, secondUnderscore);
      String action = command.substring(secondUnderscore + 1);
      
      int relayNum = relayNumStr.toInt();
      
      if (relayNum >= 1 && relayNum <= 16) {
        int arrayIndex = relayNum - 1; // Convert to 0-based index
        
        if (action == "ON") {
          digitalWrite(relayPins[arrayIndex], HIGH);
          relayStates[arrayIndex] = true;
          Serial.println("Relay " + String(relayNum) + " DIHIDUPKAN");
          SerialBT.println("OK_RELAY_" + String(relayNum) + "_ON");
        }
        else if (action == "OFF") {
          digitalWrite(relayPins[arrayIndex], LOW);
          relayStates[arrayIndex] = false;
          Serial.println("Relay " + String(relayNum) + " DIMATIKAN");
          SerialBT.println("OK_RELAY_" + String(relayNum) + "_OFF");
        }
        else {
          Serial.println("Action tidak valid: " + action);
          SerialBT.println("ERROR_INVALID_ACTION");
        }
      }
      else {
        Serial.println("Nomor relay tidak valid: " + String(relayNum));
        SerialBT.println("ERROR_INVALID_RELAY_NUMBER");
      }
    }
    else {
      Serial.println("Format perintah tidak valid: " + command);
      SerialBT.println("ERROR_INVALID_FORMAT");
    }
  }
  else if (command == "STATUS") {
    sendStatus();
  }
  else if (command == "RESET") {
    // Matikan semua relay
    for (int i = 0; i < 16; i++) {
      digitalWrite(relayPins[i], LOW);
      relayStates[i] = false;
    }
    Serial.println("Semua relay telah direset (OFF)");
    SerialBT.println("OK_ALL_RELAYS_RESET");
  }
  else {
    Serial.println("Perintah tidak dikenal: " + command);
    SerialBT.println("ERROR_UNKNOWN_COMMAND");
  }
}

void checkLimitSwitch() {
  // Baca status limit switch dengan debouncing
  bool reading = digitalRead(limitSwitchPin);
  
  if (reading != lastLimitSwitchState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastLimitSwitchState == HIGH) {
      // Limit switch ditekan (dari HIGH ke LOW karena pull-up)
      Serial.println("Limit switch ditekan!");
      SerialBT.println("LIMIT_SWITCH_PRESSED");
    }
  }
  
  lastLimitSwitchState = reading;
}

void sendStatus() {
  // Kirim status semua relay
  String status = "STATUS:";
  for (int i = 0; i < 16; i++) {
    status += "R" + String(i + 1) + ":" + (relayStates[i] ? "ON" : "OFF");
    if (i < 15) status += ",";
  }
  
  // Tambahkan status limit switch
  status += ",LS:" + String(digitalRead(limitSwitchPin) == LOW ? "PRESSED" : "RELEASED");
  
  Serial.println(status);
  SerialBT.println(status);
}

// Fungsi untuk diagnostik (opsional)
void runDiagnostic() {
  Serial.println("Menjalankan diagnostik relay...");
  
  for (int i = 0; i < 16; i++) {
    Serial.println("Testing relay " + String(i + 1));
    digitalWrite(relayPins[i], HIGH);
    delay(500);
    digitalWrite(relayPins[i], LOW);
    delay(200);
  }
  
  Serial.println("Diagnostik selesai");
}
