
#include "BLEDevice.h"
#include "BLEServer.h"
#include "BLEUtils.h"
#include "BLE2902.h"

// UUID untuk BLE Service dan Characteristics
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define LIMIT_SWITCH_UUID   "beb5483e-36e1-4688-b7f5-ea07361b26a9"

// Pin untuk 16 relay (GPIO pins)
const int relayPins[16] = {2, 4, 5, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 12, 14, 15};

// Pin untuk limit switch dan LED
const int limitSwitchPin = 13;
const int ledPin = 2;

// Variabel untuk status relay dan limit switch
bool relayStates[16] = {false};
bool lastLimitSwitchState = false;
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;

// BLE variables
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
BLECharacteristic* pLimitSwitchCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Forward declarations
void processCommand(String command);
void checkLimitSwitch();
void sendStatus();

// BLE Server Callbacks
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Client terhubung via BLE");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Client terputus dari BLE");
    }
};

// BLE Characteristic Callbacks
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = pCharacteristic->getValue().c_str();
      
      if (rxValue.length() > 0) {
        Serial.println("Perintah BLE diterima: " + rxValue);
        processCommand(rxValue);
      }
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Menginisialisasi ESP32 Relay Controller dengan BLE...");

  // Setup pin relay sebagai output
  for (int i = 0; i < 16; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW); // Matikan semua relay saat startup
  }
  
  // Setup pin limit switch dan LED
  pinMode(limitSwitchPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  // Inisialisasi BLE
  BLEDevice::init("ESP32_Relay_Controller");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Buat BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Buat Characteristic untuk menerima perintah relay
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE
                    );
  pCharacteristic->setCallbacks(new MyCallbacks());

  // Buat Characteristic untuk mengirim data limit switch
  pLimitSwitchCharacteristic = pService->createCharacteristic(
                      LIMIT_SWITCH_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  pLimitSwitchCharacteristic->addDescriptor(new BLE2902());

  // Start service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();
  
  Serial.println("ESP32 BLE Server siap dan advertising...");
  Serial.println("Device name: ESP32_Relay_Controller");
  Serial.println("Service UUID: " + String(SERVICE_UUID));
  Serial.println("16 Relay pada GPIO: 2,4,5,18,19,21,22,23,25,26,27,32,33,12,14,15");
  Serial.println("Limit Switch pada GPIO: 13");
}

void loop() {
  // Update LED indikator berdasarkan koneksi BLE
  digitalWrite(ledPin, deviceConnected ? HIGH : LOW);
  
  // Cek status limit switch
  checkLimitSwitch();
  
  // Handle BLE reconnection
  if (!deviceConnected && oldDeviceConnected) {
    delay(500); // Give some time before advertising again
    pServer->startAdvertising();
    Serial.println("Memulai advertising ulang...");
    oldDeviceConnected = deviceConnected;
  }
  
  // Connecting
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
  
  delay(10);
}

void processCommand(String command) {
  command.trim();
  
  if (command.startsWith("RELAY_")) {
    int firstUnderscore = command.indexOf('_');
    int secondUnderscore = command.indexOf('_', firstUnderscore + 1);
    
    if (firstUnderscore != -1 && secondUnderscore != -1) {
      String relayNumStr = command.substring(firstUnderscore + 1, secondUnderscore);
      String action = command.substring(secondUnderscore + 1);
      
      int relayNum = relayNumStr.toInt();
      
      if (relayNum >= 1 && relayNum <= 16) {
        int arrayIndex = relayNum - 1;
        
        if (action == "ON") {
          digitalWrite(relayPins[arrayIndex], HIGH);
          relayStates[arrayIndex] = true;
          Serial.println("Relay " + String(relayNum) + " DIHIDUPKAN");
          
          if (deviceConnected) {
            String response = "OK_RELAY_" + String(relayNum) + "_ON";
            pCharacteristic->setValue(response.c_str());
            pCharacteristic->notify();
          }
        }
        else if (action == "OFF") {
          digitalWrite(relayPins[arrayIndex], LOW);
          relayStates[arrayIndex] = false;
          Serial.println("Relay " + String(relayNum) + " DIMATIKAN");
          
          if (deviceConnected) {
            String response = "OK_RELAY_" + String(relayNum) + "_OFF";
            pCharacteristic->setValue(response.c_str());
            pCharacteristic->notify();
          }
        }
      }
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
    
    if (deviceConnected) {
      pCharacteristic->setValue("OK_ALL_RELAYS_RESET");
      pCharacteristic->notify();
    }
  }
}

void checkLimitSwitch() {
  bool reading = digitalRead(limitSwitchPin);
  
  if (reading != lastLimitSwitchState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastLimitSwitchState == HIGH) {
      Serial.println("Limit switch ditekan!");
      
      if (deviceConnected) {
        pLimitSwitchCharacteristic->setValue("LIMIT_SWITCH_PRESSED");
        pLimitSwitchCharacteristic->notify();
      }
    }
  }
  
  lastLimitSwitchState = reading;
}

void sendStatus() {
  String status = "STATUS:";
  for (int i = 0; i < 16; i++) {
    status += "R" + String(i + 1) + ":" + (relayStates[i] ? "ON" : "OFF");
    if (i < 15) status += ",";
  }
  
  status += ",LS:" + String(digitalRead(limitSwitchPin) == LOW ? "PRESSED" : "RELEASED");
  
  Serial.println(status);
  
  if (deviceConnected) {
    pCharacteristic->setValue(status.c_str());
    pCharacteristic->notify();
  }
}
