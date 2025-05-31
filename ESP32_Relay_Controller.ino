
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// UUID untuk service dan characteristic
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "87654321-4321-4321-4321-cba987654321"
#define LIMIT_SWITCH_UUID   "87654321-4321-4321-4321-cba987654322"

// Pin definitions
const int RELAY_PINS[16] = {2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26};
const int LIMIT_SWITCH_PIN = 27;

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
BLECharacteristic* pLimitSwitchCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
bool limitSwitchPressed = false;
bool oldLimitSwitchState = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Perangkat Android terhubung");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Perangkat Android terputus");
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String value = pCharacteristic->getValue();

      if (value.length() > 0) {
        Serial.println("Perintah diterima: " + value);
        
        // Parse perintah format: RELAY_X_ON/OFF
        if (value.startsWith("RELAY_")) {
          int relayNum = value.substring(6, value.indexOf("_", 6)).toInt();
          String action = value.substring(value.lastIndexOf("_") + 1);
          
          if (relayNum >= 1 && relayNum <= 16) {
            int pinIndex = relayNum - 1;
            
            if (action == "ON") {
              digitalWrite(RELAY_PINS[pinIndex], HIGH);
              Serial.println("Relay " + String(relayNum) + " dihidupkan");
            } else if (action == "OFF") {
              digitalWrite(RELAY_PINS[pinIndex], LOW);
              Serial.println("Relay " + String(relayNum) + " dimatikan");
            }
          }
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Memulai ESP32 Relay Controller...");

  // Initialize relay pins
  for (int i = 0; i < 16; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW); // Matikan semua relay saat startup
  }

  // Initialize limit switch pin
  pinMode(LIMIT_SWITCH_PIN, INPUT_PULLUP);

  // Create BLE Device
  BLEDevice::init("ESP32_Relay_Controller");

  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristic untuk menerima perintah
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE
                    );

  pCharacteristic->setCallbacks(new MyCallbacks());

  // Create BLE Characteristic untuk limit switch
  pLimitSwitchCharacteristic = pService->createCharacteristic(
                                LIMIT_SWITCH_UUID,
                                BLECharacteristic::PROPERTY_READ |
                                BLECharacteristic::PROPERTY_NOTIFY
                              );

  pLimitSwitchCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();
  
  Serial.println("ESP32 siap menerima koneksi Bluetooth LE");
  Serial.println("Nama perangkat: ESP32_Relay_Controller");
}

void loop() {
  // Check limit switch status
  bool currentLimitSwitchState = !digitalRead(LIMIT_SWITCH_PIN); // Inverted karena pull-up
  
  if (currentLimitSwitchState != oldLimitSwitchState) {
    oldLimitSwitchState = currentLimitSwitchState;
    
    if (currentLimitSwitchState && deviceConnected) {
      // Limit switch ditekan, kirim notifikasi ke Android
      String message = "LIMIT_SWITCH_PRESSED";
      pLimitSwitchCharacteristic->setValue(message.c_str());
      pLimitSwitchCharacteristic->notify();
      Serial.println("Limit switch ditekan - notifikasi dikirim ke Android");
    }
  }

  // Reconnection logic
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // Give time for bluetooth stack to get ready
    pServer->startAdvertising(); // Restart advertising
    Serial.println("Memulai ulang advertising...");
    oldDeviceConnected = deviceConnected;
  }
  
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  delay(100);
}

// Fungsi untuk mematikan semua relay (emergency stop)
void turnOffAllRelays() {
  for (int i = 0; i < 16; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
  }
  Serial.println("Semua relay dimatikan");
}

// Fungsi untuk test relay (opsional)
void testAllRelays() {
  Serial.println("Memulai test semua relay...");
  
  for (int i = 0; i < 16; i++) {
    Serial.println("Test Relay " + String(i + 1));
    digitalWrite(RELAY_PINS[i], HIGH);
    delay(500);
    digitalWrite(RELAY_PINS[i], LOW);
    delay(200);
  }
  
  Serial.println("Test relay selesai");
}
