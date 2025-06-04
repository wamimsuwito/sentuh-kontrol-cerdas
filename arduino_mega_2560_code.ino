
/*
  Arduino Mega 2560 Relay Control System
  Untuk aplikasi Nice Ningrum - Sentuh Kontrol Cerdas
  
  Koneksi:
  - Relay 1-16: Pin Digital 22-37
  - LED Indikator: Pin 13 (built-in)
  - Limit Switch: Pin 2 (dengan interrupt)
  
  Komunikasi: USB Serial (9600 baud)
  Format Perintah: RELAY_<nomor>_<ON/OFF>
  Contoh: RELAY_1_ON, RELAY_5_OFF
*/

// Pin definitions
const int RELAY_PINS[] = {22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37};
const int LED_PIN = 13;
const int LIMIT_SWITCH_PIN = 2;

// Variables
String inputString = "";
boolean stringComplete = false;
volatile boolean limitSwitchPressed = false;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  Serial.println("Arduino Mega 2560 Relay Control System");
  Serial.println("Nice Ningrum - Ready for commands");
  
  // Initialize relay pins
  for (int i = 0; i < 16; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], LOW); // Relay OFF (assuming active HIGH)
  }
  
  // Initialize LED pin
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize limit switch with interrupt
  pinMode(LIMIT_SWITCH_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(LIMIT_SWITCH_PIN), limitSwitchISR, FALLING);
  
  // Blink LED to indicate ready
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
  
  Serial.println("System initialized successfully");
}

void loop() {
  // Check for serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  
  // Check limit switch
  if (limitSwitchPressed) {
    Serial.println("LIMIT_SWITCH_PRESSED");
    limitSwitchPressed = false;
    
    // Turn off all relays when limit switch is pressed
    turnOffAllRelays();
    
    // Blink LED to indicate limit switch activation
    for (int i = 0; i < 5; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }
  }
  
  delay(10); // Small delay for stability
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}

void processCommand(String command) {
  command.trim();
  Serial.print("Received command: ");
  Serial.println(command);
  
  // Parse command format: RELAY_<number>_<action>
  if (command.startsWith("RELAY_")) {
    int firstUnderscore = command.indexOf('_');
    int secondUnderscore = command.indexOf('_', firstUnderscore + 1);
    
    if (firstUnderscore != -1 && secondUnderscore != -1) {
      String relayNumberStr = command.substring(firstUnderscore + 1, secondUnderscore);
      String action = command.substring(secondUnderscore + 1);
      
      int relayNumber = relayNumberStr.toInt();
      
      if (relayNumber >= 1 && relayNumber <= 16) {
        int relayIndex = relayNumber - 1; // Convert to 0-based index
        
        if (action == "ON") {
          digitalWrite(RELAY_PINS[relayIndex], HIGH);
          digitalWrite(LED_PIN, HIGH);
          Serial.print("Relay ");
          Serial.print(relayNumber);
          Serial.println(" turned ON");
        } else if (action == "OFF") {
          digitalWrite(RELAY_PINS[relayIndex], LOW);
          digitalWrite(LED_PIN, LOW);
          Serial.print("Relay ");
          Serial.print(relayNumber);
          Serial.println(" turned OFF");
        } else {
          Serial.println("Invalid action. Use ON or OFF");
        }
      } else {
        Serial.println("Invalid relay number. Use 1-16");
      }
    } else {
      Serial.println("Invalid command format");
    }
  } else if (command == "STATUS") {
    // Send status of all relays
    Serial.println("Relay Status:");
    for (int i = 0; i < 16; i++) {
      Serial.print("Relay ");
      Serial.print(i + 1);
      Serial.print(": ");
      Serial.println(digitalRead(RELAY_PINS[i]) ? "ON" : "OFF");
    }
  } else if (command == "RESET") {
    // Turn off all relays
    turnOffAllRelays();
    Serial.println("All relays turned OFF");
  } else {
    Serial.println("Unknown command");
    Serial.println("Available commands:");
    Serial.println("RELAY_<1-16>_ON - Turn on specific relay");
    Serial.println("RELAY_<1-16>_OFF - Turn off specific relay");
    Serial.println("STATUS - Show all relay status");
    Serial.println("RESET - Turn off all relays");
  }
}

void turnOffAllRelays() {
  for (int i = 0; i < 16; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
  }
  digitalWrite(LED_PIN, LOW);
  Serial.println("All relays turned OFF");
}

void limitSwitchISR() {
  limitSwitchPressed = true;
}

// Test function - uncomment to test relays sequentially
/*
void testAllRelays() {
  Serial.println("Testing all relays...");
  
  for (int i = 0; i < 16; i++) {
    Serial.print("Testing Relay ");
    Serial.println(i + 1);
    
    digitalWrite(RELAY_PINS[i], HIGH);
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    
    digitalWrite(RELAY_PINS[i], LOW);
    digitalWrite(LED_PIN, LOW);
    delay(500);
  }
  
  Serial.println("Relay test completed");
}
*/
