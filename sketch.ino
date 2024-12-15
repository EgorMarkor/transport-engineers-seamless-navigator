#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLEAdvertising.h>

// Имя устройства BLE
#define DEVICE_NAME "ESP32_BLE_Device"

// Значение TX Power (по умолчанию -59 dBm для BLE)
#define TX_POWER_LEVEL ESP_PWR_LVL_N3  // Вы можете выбрать уровень от ESP_PWR_LVL_N12 до ESP_PWR_LVL_N0

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE work!");

  // Инициализация BLE
  BLEDevice::init(DEVICE_NAME);

  // Создание BLE-сервера
  BLEServer *pServer = BLEDevice::createServer();

  // Настройка рекламы
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->setScanResponse(true);  // Установить расширенный ответ для сканирования
  pAdvertising->setMinPreferred(0x06); // Минимальный интервал рекламы
  pAdvertising->setMinPreferred(0x12); // Максимальный интервал рекламы

  // Установка мощности BLE-передатчика
  BLEDevice::setPower(TX_POWER_LEVEL);

  // Добавление произвольного рекламного пакета (например, служебные UUID)
  BLEAdvertisementData advertisementData;
  advertisementData.setName(DEVICE_NAME); // Установка имени устройства
  pAdvertising->setAdvertisementData(advertisementData);

  // Запуск рекламы
  pAdvertising->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
if (pAdvertising) {
  Serial.println("BLE advertising initialized.");
} else {
  Serial.println("Failed to initialize BLE advertising.");
}
}

void loop() {
  // Здесь ничего не нужно, BLE будет работать в фоновом режиме
  delay(1000);
}
