# Overview
This code forward the UART message from stm32 to firebase realtime database cloud. The flow is I always polling for message in UART and sending every 2 seconds (only send the new one, it's handled via UART protocol)

# Wiring
- Connect the ESP32 T7 (rx) to STM32 D8 (tx)
- Connect the ESP32 T8 (tx) to STM32 D2 (rx)
- Connect the ESP32 GND to STM32 GND
I selected UART1 (not UART2!) in STM32, the ESP32 doesn't need this config

# JSON Format
```json
{"dist": 120, "light": 450, "sound": 1}
```
Ensure this each keys are labeled like that and values are integer, otherwise the program will failed (in validateUARTInput block)

# Library
- FirebaseClient
- ArduinoJson
- EspSoftwareSerial

# Credential
```c++
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_CREDENTIAL"

#define Web_API_KEY "FIREBASE_WEB_API_KEY"
#define DATABASE_URL "https://embedded-final-project-e8732-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "FIREBASE_USER_EMAIL"
#define USER_PASS "FIREBASE_USER_PASS"
```
**WiFi**
Your wifi key and password. The ChulaWifi probably wouldn't work since its public internet. If u use your own hotspot and in IOS please check maximize compatability (chat told me, IDK).
**Firebase**
- API_KEY can be get through project setting and your apps and check config.
- USER_EMAIL and USER_PASS you can create a new one in authentication tab and add user.

If confused about each credentials, I followed firebase process from [this blog](https://randomnerdtutorials.com/esp32-firebase-realtime-database/)