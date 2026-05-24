#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

Adafruit_MPU6050 mpu;
Adafruit_BMP280 bmp;

#define SEALEVELPRESSURE_HPA (1013.25)

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10); 

  if (!mpu.begin()) {
    while (1) { delay(10); }
  }
  
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  if (!bmp.begin(0x76)) {
    while (1) { delay(10); }
  }

  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,
                  Adafruit_BMP280::SAMPLING_X2,
                  Adafruit_BMP280::SAMPLING_X16,
                  Adafruit_BMP280::FILTER_X16,
                  Adafruit_BMP280::STANDBY_MS_500);
                  
  Serial.println("Waktu_ms,Ketinggian_m,Pitch_deg,Roll_deg");
  delay(1000);
}

void loop() {
  sensors_event_t a, g, temp_mpu;
  mpu.getEvent(&a, &g, &temp_mpu);

  // Hitung Pitch dan Roll
  float pitch = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
  float roll = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;

  // Hitung Ketinggian
  float altitude = bmp.readAltitude(SEALEVELPRESSURE_HPA);

  
  Serial.print(millis());
  Serial.print(", Ketinggian (Altitude) : ");
  Serial.print(altitude);
  Serial.print(", Kemiringan (pitch) : ");
  Serial.print(pitch);
  Serial.print(", Kemiringan (roll) : ");
  Serial.println(roll);

  delay(1000);
}