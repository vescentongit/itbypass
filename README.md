# What is ITBypass?

Intinya ITBypass dipakai buat nyari jalan paling enak di kampus. Bukan cuma yang paling pendek, tapi juga yang paling ga bikin ngos-ngosan. Ide awalnya dari program route finding berbasis C++/Dijkstra, lalu sekarang dikembangkan jadi aplikasi web mobile-first dengan peta interaktif, pilihan rute tercepat dan terlandai, data lokasi kampus, serta pipeline sensor untuk merekam data ketinggian dan kemiringan jalur.

Program ini juga sudah punya struktur untuk menghindari jalan yang tidak ada atapnya saat hujan. Di versi web saat ini, parameter hujan sudah disiapkan di API route, walaupun tombol/mode hujan belum ditampilkan di UI utama.

---

## Latar Belakang

Pengalaman dari awal OSKM, kampus kita capek banget buat jalan. Jalan 200 meter tapi nanjak beda rasanya sama jalan 300 meter tapi datar. Belum lagi kalau hujan, jalan yang ga ada atapnya bisa jadi masalah besar.

ITBypass mencoba menghitung rute dengan mempertimbangkan tiga hal:

- **Jarak**
- **Kemiringan jalan**
- **Kondisi cuaca / keberadaan atap**

Algoritma utamanya adalah Dijkstra, tapi weight function-nya dimodifikasi:

```text
biaya = jarak + roofPenalty + (slopeWeight * kemiringan)
```

Keterangan:

- `slopeWeight`: seberapa peka program terhadap tanjakan. Nilainya `0` untuk mode rute tercepat, dan lebih besar untuk mode rute yang lebih landai.
- `roofPenalty`: kalau hujan dan jalan tidak ada atapnya, diberi penalti besar agar Dijkstra cenderung menghindari jalur tersebut.
- `kemiringan`: dihitung dari perubahan elevasi terhadap jarak antar titik.

---

## Kondisi Project Sekarang

Repo ini sekarang berisi aplikasi web berbasis Next.js, bukan hanya program terminal.

Fitur yang sudah ada:

- Splash screen ITBypass.
- Halaman home dengan peta kampus.
- Bottom sheet untuk pencarian tujuan.
- Daftar lokasi kampus ITB Jatinangor.
- Pemilihan lokasi lewat daftar atau peta.
- Perhitungan rute melalui API internal Next.js.
- Mode rute:
  - `Tercepat`
  - `Terlandai`
- Visualisasi hasil rute dengan polyline di peta.
- Dataset sensor dalam bentuk CSV.
- Kode Arduino untuk merekam ketinggian dan kemiringan.
- Logger Python untuk menyimpan data serial sensor ke CSV.

---

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- React Leaflet
- Leaflet
- OpenStreetMap
- Python untuk logger sensor dan test route
- Arduino/ESP32 dengan sensor MPU6050 dan BMP280

---

## How to Use

### 1. Install dependency

```bash
npm install
```

### 2. Jalankan frontend

```bash
npm run dev
```

Setelah itu buka aplikasi di browser sesuai alamat yang muncul di terminal, biasanya:

```text
http://localhost:3000
```

### 3. Alur pakai aplikasi

1. Buka aplikasi.
2. Splash screen akan masuk otomatis ke halaman home.
3. Tekan search bar `Where to ?`.
4. Pilih lokasi awal dan lokasi tujuan.
5. Lokasi bisa dipilih dari daftar atau lewat peta.
6. Tekan `Lanjut`.
7. Aplikasi menghitung rute.
8. Pilih mode rute `Tercepat` atau `Terlandai`.
9. Rute akan muncul di peta.

---

## API Route

Perhitungan rute utama berada di:

```text
app/api/route/route.ts
```

Endpoint:

```text
POST /api/route
```

Input yang dikirim frontend berisi:

- `nodes`: daftar titik lokasi dan waypoint.
- `edges`: daftar hubungan antar titik.
- `start`: nama lokasi awal.
- `goal`: nama lokasi tujuan.
- `slope_weight`: bobot kemiringan.
- `is_raining`: kondisi hujan.

Mode rute di frontend:

```text
fast -> slope_weight = 0
flat -> slope_weight = 10
```

---

## Data Lokasi

Data lokasi kampus berada di:

```text
app/data/campus-locations.ts
```

File ini berisi nama lokasi, alamat, jarak tampilan, dan koordinat latitude-longitude. Contoh lokasi:

- Gerbang Utama ITB Jatinangor
- Parkiran Motor
- Gedung Kuliah Umum I
- Gedung Kuliah Umum II
- Labtek IA
- Labtek IB
- Rektorat
- KOICA
- GSG
- Asrama Mahasiswa ITB
- Gedung Kuliah A, C, D, E

Data graph untuk route building berada di:

```text
app/data/campus-route-api.ts
```

Di file ini, lokasi kampus digabungkan dengan waypoint koridor, data elevasi, dan edge antar jalur.

---

## Data Sensor CSV

Dataset hasil perekaman sensor berada di:

```text
src/csv/
```

Sebagian besar file CSV berisi data:

```text
Waktu_Laptop,Waktu_Boot_ESP32_ms,Ketinggian_m,Pitch_deg,Roll_deg
```

Contoh file:

```text
asrama_lapbol.csv
GedungD_ke_Koica_jalur1.csv
GKU1_ke_GedungD.csv
GKU2_ke_GKU1_jalur_aspal.csv
GKU2_ke_GKU1_jalur_tangga.csv
gku3_rektorat.csv
Koica_rektorat.csv
rektorat_gku1.csv
sedimentasi_gku2.csv
```

Catatan: beberapa data CSV masih berisi format teks dari output serial seperti `Ketinggian (Altitude) : ...`, sehingga kalau mau dipakai untuk analisis numerik langsung, perlu cleaning/parsing dulu.

---

## Arduino Sensor Logger

Kode Arduino berada di:

```text
hardware/arduino/ITBypass_CSV.ino
```

Sensor yang digunakan:

- MPU6050 untuk membaca akselerometer dan menghitung `pitch` serta `roll`.
- BMP280 untuk membaca tekanan udara dan menghitung estimasi ketinggian.

Workflow Arduino:

1. Program memulai komunikasi serial dengan baud rate `115200`.
2. Program menginisialisasi sensor MPU6050 melalui I2C.
3. Jika MPU6050 tidak terdeteksi, program berhenti.
4. Program mengatur range akselerometer, gyroscope, dan filter bandwidth.
5. Program menginisialisasi sensor BMP280 pada alamat I2C `0x76`.
6. Jika BMP280 tidak terdeteksi, program berhenti.
7. Program mengatur konfigurasi sampling BMP280.
8. Program mencetak header data ke Serial.
9. Program membaca akselerasi X, Y, dan Z dari MPU6050.
10. Program menghitung `pitch` dan `roll`.
11. Program membaca ketinggian dari BMP280.
12. Program mengirim waktu, ketinggian, pitch, dan roll melalui Serial.
13. Program menunggu 1 detik.
14. Proses diulang terus selama perangkat menyala.

---

## Python Logger

Script logger berada di:

```text
scripts/logging/logger.py
```

Fungsinya:

1. Membuka koneksi serial ke Arduino/ESP32.
2. Membaca baris data dari Serial.
3. Mengabaikan header bawaan dari Arduino.
4. Menambahkan timestamp laptop.
5. Menulis data ke file CSV.
6. Melakukan `flush()` agar data langsung tersimpan.

Sebelum dipakai, sesuaikan port serial:

```python
serial_port = '/dev/cu.usbserial-0001'
```

Untuk Windows, port biasanya berbentuk:

```text
COM3
COM4
COM5
```

---

## Cara Kerja Singkat Algoritma

1. Frontend membuat daftar node dan edge dari data lokasi kampus.
2. User memilih lokasi awal dan tujuan.
3. Frontend mengirim graph, start, goal, mode, dan kondisi hujan ke API.
4. API mencari index node awal dan tujuan.
5. Semua jarak awal diisi `Infinity`.
6. Node awal dimasukkan ke priority queue.
7. Dijkstra mengambil node dengan cost terkecil.
8. API mengecek semua edge keluar dari node tersebut.
9. Untuk tiap edge, API menghitung jarak dan slope.
10. Jika hujan dan jalan tidak beratap, API menambahkan `roofPenalty`.
11. Jika total cost baru lebih murah, jarak dan parent node diperbarui.
12. Proses berulang sampai node tujuan ditemukan.
13. API merekonstruksi path dari array `prev`.
14. Frontend menerima path dan menggambarnya di peta.

---

## Anggota

| Nama                       | NIM      |
|----------------------------|----------|
| Muhammad Orkhan            | 18225091 |
| Agastya Tristan Dhaniswara | 18225093 |
| Tirta Wening Putri Harsono | 18225095 |
| Fayza Kamilia              | 18225097 |
| Lana Dzakira Cahyadi       | 18225099 |

---W

## Lisensi

MIT
