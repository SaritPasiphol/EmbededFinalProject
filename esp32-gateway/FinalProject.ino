#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <ArduinoJson.h>

#define ESP32_RX_PIN T7
#define ESP32_TX_PIN T8

// Network and Firebase credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_CREDENTIAL"

#define Web_API_KEY "FIREBASE_WEB_API_KEY"
#define DATABASE_URL "https://embedded-final-project-e8732-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "FIREBASE_USER_EMAIL"
#define USER_PASS "FIREBASE_USER_PASS"

// User function
void processData(AsyncResult &aResult);

// Authentication
UserAuth user_auth(Web_API_KEY, USER_EMAIL, USER_PASS);

bool validateUARTInput(String &Input);

HardwareSerial SensorUART(1);
const int led = 13;

// Ensure Default Values
String sensorData = "{\"dist\": 0, \"light\": 0, \"sound\": 0}";

// Firebase components
FirebaseApp app;
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
RealtimeDatabase Database;

// Timer variables for sending data every 0.8 seconds
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 800; // 0.8 seconds in milliseconds

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);

  Serial.begin(115200);

  SensorUART.begin(115200, SERIAL_8N1, ESP32_RX_PIN, ESP32_TX_PIN);
  Serial.println("Initialized UART Serial");

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  
  // Configure SSL client
  ssl_client.setInsecure();
  ssl_client.setConnectionTimeout(1000);
  ssl_client.setHandshakeTimeout(5);
  
  // Initialize Firebase
  initializeApp(aClient, app, getAuth(user_auth), processData, "🔐 authTask");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
}

void loop(void) {
  // Maintain authentication and async tasks
  app.loop();

  if (SensorUART.available()){
    String incomingData = SensorUART.readStringUntil('\n');
    incomingData.trim();

    // Check if valid package and if authentication is ready
    if(incomingData.length() > 0 && app.ready()) {
      sensorData = incomingData;

      // Check for calibrator
      if (isCalibrateMessage(sensorData)) {
        Serial.println("Received calibration message: " + sensorData);
        
        if (validateUARTInput(sensorData)) 
          Database.set<object_t>(aClient, "/sensor/normal", object_t(sensorData), processData, "RTDB_Set_Normal");
      }

      else {
        Serial.println("STM32 Data Received (UART):" + sensorData);

        unsigned long currentTime = millis();
        if(currentTime - lastSendTime >= sendInterval){
          lastSendTime = currentTime;

          if(!validateUARTInput(sensorData))
            return;

          Database.set<object_t>(aClient, "/sensor/current", object_t(sensorData), processData, "RTDB_Send_Current_Sensor");
          Database.push<object_t>(aClient, "/sensor/history", object_t(sensorData), processData, "RTDB_Push_History_Sensor");
        }
      }
    }
  }
}

void processData(AsyncResult &aResult) {
  if (!aResult.isResult())
    return;

  if (aResult.isEvent())
    Firebase.printf("Event task: %s, msg: %s, code: %d\n", aResult.uid().c_str(), aResult.eventLog().message().c_str(), aResult.eventLog().code());

  if (aResult.isDebug())
    Firebase.printf("Debug task: %s, msg: %s\n", aResult.uid().c_str(), aResult.debug().c_str());

  if (aResult.isError())
    Firebase.printf("Error task: %s, msg: %s, code: %d\n", aResult.uid().c_str(), aResult.error().message().c_str(), aResult.error().code());

  if (aResult.available())
    Firebase.printf("task: %s, payload: %s\n", aResult.uid().c_str(), aResult.c_str());
}

bool validateUARTInput(String &Input){
  JsonDocument doc;

  // Deserialize the JSON document
  DeserializationError error = deserializeJson(doc, Input);

  // Test if parsing succeeds.
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return false;
  }

  if (!doc["dist"].is<int>()) {
    Serial.println("Error: 'dist' is missing or not an integer!");
    return false;
  }

  if (!doc["light"].is<int>()) {
    Serial.println("Error: 'light' is missing or not an integer!");
    return false;
  }

  if (!doc["sound"].is<int>()) { 
      Serial.println("Error: 'sound' is missing or not an integer!");
      return false;
  }

  return true;
}

bool isCalibrateMessage(String &Input) {
  JsonDocument doc;
  
  // Deserialize the JSON document
  DeserializationError error = deserializeJson(doc, Input);

  // Test if parsing succeeds.
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return false;
  }

  // Check if "calibrate" exists
  if (doc.containsKey("calibrate") && doc["calibrate"] == 1) {
    return true;
  }

  return false;
}
