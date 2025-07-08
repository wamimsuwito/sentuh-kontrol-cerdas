#include "BLEDevice.h"
#include "BLEServer.h"
#include "BLEUtils.h"
#include "BLE2902.h"

// UUID Nordic UART Service - MATCH DENGAN APLIKASI
#define SERVICE_UUID           "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_RX "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_TX "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

BLEServer* pServer = NULL;
BLECharacteristic* pTxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

const int RELAY_PINS[16] = {2, 4, 5, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 13, 14, 15};
const int LIMIT_SWITCH_PIN = 12;
const int DISTANCE_SENSOR_TRIG_PIN = 16;  // Pin untuk sensor jarak (Trigger)
const int DISTANCE_SENSOR_ECHO_PIN = 17;  // Pin untuk sensor jarak (Echo)

bool relayStates[16];
bool limitSwitchPressed = false;
bool lastLimitSwitchState = false;
bool customerDetected = false;
bool lastCustomerState = false;

unsigned long lastCommandTime = 0;
const unsigned long COMMAND_TIMEOUT = 30000; // 30 detik
const int CUSTOMER_DETECTION_DISTANCE = 50; // 50 cm untuk deteksi pelanggan

// Fungsi forward declaration
void sendBLEMessage(String message);
void processCommand(String command);
void activateRelay(int relayNumber);
void deactivateRelay(int relayNumber);
void checkLimitSwitch();
void checkCustomerSensor();
void checkRelayTimeout();
void resetAllRelays();
void sendStatus();
void sendRelayStatus(int relayNumber);
void initializeSystem();
void setupBLE();

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("✅ Client terhubung via BLE");
    sendBLEMessage("ESP32_CONNECTED");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("❌ Client terputus dari BLE");
    delay(500);
    pServer->getAdvertising()->start();
    Serial.println("🔄 Restart BLE advertising");
  }
};

class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String value = String(pCharacteristic->getValue().c_str());

    if (value.length() > 0) {
      value.trim();
      Serial.println("📥 Perintah diterima: " + value);
      processCommand(value);
    }
  }
};

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("=================================");
  Serial.println("🚀 ESP32 Relay Controller Starting...");
  Serial.println("=================================");

  initializeSystem();
  setupBLE();

  Serial.println("✅ Setup selesai - ESP32 siap digunakan!");
  Serial.println("📡 Nama BLE: ESP32_Relay_Controller");
  Serial.println("🔗 Service UUID: 6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  Serial.println("📏 Sensor jarak: TRIG=" + String(DISTANCE_SENSOR_TRIG_PIN) + ", ECHO=" + String(DISTANCE_SENSOR_ECHO_PIN));

  delay(1000);
  sendBLEMessage("ESP32_READY");
}

void loop() {
  checkLimitSwitch();
  checkCustomerSensor();
  checkRelayTimeout();

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("🔄 Mulai advertising BLE lagi");
    oldDeviceConnected = deviceConnected;
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
    Serial.println("✅ BLE connection established");
  }

  delay(100);
}

void initializeSystem() {
  Serial.println("⚙️ Inisialisasi pin relay...");
  for (int i = 0; i < 16; i++) {
    relayStates[i] = false;
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW);
    Serial.printf("✅ Relay %d initialized\n", i + 1);
    delay(50);
  }

  pinMode(LIMIT_SWITCH_PIN, INPUT_PULLUP);
  Serial.println("✅ Limit switch initialized");
  
  // Initialize distance sensor pins
  pinMode(DISTANCE_SENSOR_TRIG_PIN, OUTPUT);
  pinMode(DISTANCE_SENSOR_ECHO_PIN, INPUT);
  Serial.println("✅ Distance sensor initialized");
  
  Serial.println("✅ Sistem hardware siap!");
}

void setupBLE() {
  Serial.println("📡 Inisialisasi BLE...");

  BLEDevice::init("ESP32_Relay_Controller");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_TX,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
  pTxCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic* pRxCharacteristic = pService->createCharacteristic(
                                           CHARACTERISTIC_UUID_RX,
                                           BLECharacteristic::PROPERTY_WRITE
                                         );
  pRxCharacteristic->setCallbacks(new MyCallbacks());

  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();

  Serial.println("✅ BLE service aktif dan advertising");
  Serial.println("📡 Menunggu koneksi dari aplikasi...");
}

void sendBLEMessage(String message) {
  if (deviceConnected && pTxCharacteristic) {
    pTxCharacteristic->setValue(message.c_str());
    pTxCharacteristic->notify();
    Serial.println("📤 Kirim BLE: " + message);
  } else {
    Serial.println("⚠️ BLE tidak terhubung, pesan tidak terkirim: " + message);
  }
}

void processCommand(String command) {
  command.toUpperCase();
  command.trim();
  Serial.println("⚙️ Memproses perintah: " + command);

  if (command.startsWith("RELAY")) {
    int underscoreIndex = command.indexOf('_');
    if (underscoreIndex > 0) {
      String relayPart = command.substring(5, underscoreIndex);
      String actionPart = command.substring(underscoreIndex + 1);
      int relayNumber = relayPart.toInt();

      if (relayNumber >= 1 && relayNumber <= 16) {
        if (actionPart == "ON") {
          activateRelay(relayNumber - 1); // Convert to 0-based index
        } else if (actionPart == "OFF") {
          deactivateRelay(relayNumber - 1); // Convert to 0-based index
        } else {
          sendBLEMessage("ERROR:INVALID_ACTION");
        }
      } else {
        sendBLEMessage("ERROR:INVALID_RELAY_NUMBER");
      }
    } else {
      sendBLEMessage("ERROR:INVALID_RELAY_FORMAT");
    }
  }
  else if (command == "STATUS") {
    sendStatus();
  }
  else if (command == "RESET") {
    resetAllRelays();
  }
  else if (command == "PING") {
    sendBLEMessage("PONG");
  }
  else if (command == "TEST") {
    sendBLEMessage("ESP32_TEST_OK");
  }
  else if (command == "GET_CUSTOMER_STATUS") {
    sendBLEMessage("CUSTOMER_STATUS:" + String(customerDetected ? "DETECTED" : "NONE"));
  }
  else {
    sendBLEMessage("ERROR:UNKNOWN_COMMAND:" + command);
  }
}

void activateRelay(int relayNumber) {
  if (relayNumber >= 0 && relayNumber < 16) {
    digitalWrite(RELAY_PINS[relayNumber], HIGH);
    relayStates[relayNumber] = true;
    lastCommandTime = millis();

    sendBLEMessage("RELAY" + String(relayNumber + 1) + "_ACTIVATED"); // Send 1-based number
    sendRelayStatus(relayNumber);
    
    Serial.printf("⚡ Relay %d ACTIVATED\n", relayNumber + 1);
  }
}

void deactivateRelay(int relayNumber) {
  if (relayNumber >= 0 && relayNumber < 16) {
    digitalWrite(RELAY_PINS[relayNumber], LOW);
    relayStates[relayNumber] = false;

    sendBLEMessage("RELAY" + String(relayNumber + 1) + "_DEACTIVATED"); // Send 1-based number
    sendRelayStatus(relayNumber);
    
    Serial.printf("⚡ Relay %d DEACTIVATED\n", relayNumber + 1);
  }
}

void checkLimitSwitch() {
  bool currentState = (digitalRead(LIMIT_SWITCH_PIN) == LOW);
  if (currentState != lastLimitSwitchState) {
    delay(50);
    currentState = (digitalRead(LIMIT_SWITCH_PIN) == LOW);

    if (currentState != lastLimitSwitchState) {
      limitSwitchPressed = currentState;
      lastLimitSwitchState = currentState;

      if (currentState) {
        sendBLEMessage("LIMIT_SWITCH_PRESSED");
        Serial.println("🔘 LIMIT SWITCH PRESSED");
      } else {
        sendBLEMessage("LIMIT_SWITCH_RELEASED");
        Serial.println("🔘 LIMIT SWITCH RELEASED");
      }
    }
  }
}

void checkCustomerSensor() {
  // Trigger ultrasonic sensor
  digitalWrite(DISTANCE_SENSOR_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(DISTANCE_SENSOR_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(DISTANCE_SENSOR_TRIG_PIN, LOW);
  
  // Read echo
  long duration = pulseIn(DISTANCE_SENSOR_ECHO_PIN, HIGH);
  long distance = (duration * 0.034) / 2; // Convert to cm
  
  bool currentCustomerState = (distance > 0 && distance <= CUSTOMER_DETECTION_DISTANCE);
  
  if (currentCustomerState != lastCustomerState) {
    delay(100); // Debounce
    // Read again to confirm
    digitalWrite(DISTANCE_SENSOR_TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(DISTANCE_SENSOR_TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(DISTANCE_SENSOR_TRIG_PIN, LOW);
    
    duration = pulseIn(DISTANCE_SENSOR_ECHO_PIN, HIGH);
    distance = (duration * 0.034) / 2;
    currentCustomerState = (distance > 0 && distance <= CUSTOMER_DETECTION_DISTANCE);
    
    if (currentCustomerState != lastCustomerState) {
      customerDetected = currentCustomerState;
      lastCustomerState = currentCustomerState;
      
      if (currentCustomerState) {
        Serial.printf("👤 Pelanggan terdeteksi! Jarak: %ld cm\n", distance);
        sendBLEMessage("CUSTOMER_DETECTED");
        sendBLEMessage("WAKE_SCREEN");
      } else {
        Serial.println("👋 Pelanggan pergi");
        sendBLEMessage("CUSTOMER_LEFT");
      }
    }
  }
}

void checkRelayTimeout() {
  if (lastCommandTime > 0) {
    unsigned long currentTime = millis();
    if (currentTime < lastCommandTime) {
      lastCommandTime = currentTime;
      return;
    }

    if ((currentTime - lastCommandTime) > COMMAND_TIMEOUT) {
      bool anyRelayActive = false;
      for (int i = 0; i < 16; i++) {
        if (relayStates[i]) {
          anyRelayActive = true;
          break;
        }
      }

      if (anyRelayActive) {
        resetAllRelays();
        sendBLEMessage("TIMEOUT_SAFETY_RESET");
        lastCommandTime = 0;
        Serial.println("⏰ TIMEOUT - All relays reset");
      }
    }
  }
}

void resetAllRelays() {
  Serial.println("🔄 Resetting all relays...");
  for (int i = 0; i < 16; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
    relayStates[i] = false;
    delay(10);
  }

  lastCommandTime = 0;
  sendBLEMessage("ALL_RELAYS_RESET");
  sendStatus();
  Serial.println("✅ All relays reset completed");
}

void sendStatus() {
  String status = "STATUS:";
  for (int i = 0; i < 16; i++) {
    status += (relayStates[i] ? "1" : "0");
    if (i < 15) status += ",";
  }

  status += ":LIMIT:" + String(limitSwitchPressed ? "1" : "0");
  status += ":CUSTOMER:" + String(customerDetected ? "1" : "0");
  status += ":TIME:" + String(millis());

  sendBLEMessage(status);
}

void sendRelayStatus(int relayNumber) {
  if (relayNumber >= 0 && relayNumber < 16) {
    String status = "RELAY" + String(relayNumber + 1) + "_STATUS:"; // Send 1-based number
    status += (relayStates[relayNumber] ? "ON" : "OFF");

    sendBLEMessage(status);
  }
}
