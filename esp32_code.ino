
// ESP32 Relay Controller Code
// 16 Relay dengan 1 Limit Switch
// Komunikasi Serial USB dengan Android

// Pin definitions
const int RELAY_PINS[16] = {2, 4, 5, 18, 19, 21, 22, 23, 13, 12, 14, 27, 26, 25, 33, 32};
const int LIMIT_SWITCH_PIN = 15;

// Variables
bool relayStates[16] = {false};
bool lastLimitSwitchState = false;
unsigned long lastCommandTime = 0;
const unsigned long RELAY_TIMEOUT = 10000; // 10 seconds timeout

void setup() {
  // Initialize Serial communication
  Serial.begin(115200);
  
  // Initialize relay pins
  for (int i = 0; i < 16; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW); // Turn off all relays initially
  }
  
  // Initialize limit switch pin
  pinMode(LIMIT_SWITCH_PIN, INPUT_PULLUP);
  
  Serial.println("ESP32 Relay Controller Ready");
  Serial.println("Commands: RELAY_ON:X, RELAY_OFF:X (X = 1-16)");
  Serial.println("16 Relays, 1 Limit Switch");
}

void loop() {
  // Check for serial commands
  handleSerialCommands();
  
  // Check limit switch
  checkLimitSwitch();
  
  // Auto turn off relays after timeout
  checkRelayTimeout();
  
  delay(50);
}

void handleSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.startsWith("RELAY_ON:")) {
      int relayNum = command.substring(9).toInt();
      if (relayNum >= 1 && relayNum <= 16) {
        turnOnRelay(relayNum - 1); // Convert to 0-based index
        lastCommandTime = millis();
      }
    }
    else if (command.startsWith("RELAY_OFF:")) {
      int relayNum = command.substring(10).toInt();
      if (relayNum >= 1 && relayNum <= 16) {
        turnOffRelay(relayNum - 1); // Convert to 0-based index
      }
    }
    else if (command == "STATUS") {
      sendRelayStatus();
    }
    else if (command == "RESET") {
      turnOffAllRelays();
    }
  }
}

void checkLimitSwitch() {
  bool currentState = digitalRead(LIMIT_SWITCH_PIN) == LOW; // Inverted because of pullup
  
  if (currentState && !lastLimitSwitchState) {
    // Limit switch pressed
    Serial.println("LIMIT_SWITCH_PRESSED");
    
    // Turn off all relays when limit switch is pressed
    turnOffAllRelays();
  }
  
  lastLimitSwitchState = currentState;
}

void checkRelayTimeout() {
  if (millis() - lastCommandTime > RELAY_TIMEOUT) {
    // Auto turn off all relays after timeout
    for (int i = 0; i < 16; i++) {
      if (relayStates[i]) {
        turnOffRelay(i);
      }
    }
  }
}

void turnOnRelay(int relayIndex) {
  if (relayIndex >= 0 && relayIndex < 16) {
    digitalWrite(RELAY_PINS[relayIndex], HIGH);
    relayStates[relayIndex] = true;
    Serial.println("RELAY_" + String(relayIndex + 1) + "_ON");
  }
}

void turnOffRelay(int relayIndex) {
  if (relayIndex >= 0 && relayIndex < 16) {
    digitalWrite(RELAY_PINS[relayIndex], LOW);
    relayStates[relayIndex] = false;
    Serial.println("RELAY_" + String(relayIndex + 1) + "_OFF");
  }
}

void turnOffAllRelays() {
  for (int i = 0; i < 16; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
    relayStates[i] = false;
  }
  Serial.println("ALL_RELAYS_OFF");
}

void sendRelayStatus() {
  String status = "RELAY_STATUS:";
  for (int i = 0; i < 16; i++) {
    status += String(relayStates[i]);
    if (i < 15) status += ",";
  }
  Serial.println(status);
}

// Additional safety functions
void emergencyStop() {
  turnOffAllRelays();
  Serial.println("EMERGENCY_STOP_ACTIVATED");
}

// Watchdog function - call this periodically from Android
void resetWatchdog() {
  lastCommandTime = millis();
  Serial.println("WATCHDOG_RESET");
}
