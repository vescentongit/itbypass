import serial
import csv
import time
from datetime import datetime # Library tambahan untuk mengambil waktu

# --- KONFIGURASI PORT ---
serial_port = '/dev/cu.usbserial-0001'  # GANTI SESUAI NAMA PORT ANDA
baud_rate = 115200
nama_file = 'sedimentasi_gku2.csv'

try:
    # Membuka koneksi serial ke ESP32
    ser = serial.Serial(serial_port, baud_rate, timeout=1)
    time.sleep(2) # Tunggu hingga koneksi stabil
    print(f"Mulai merekam data dari {serial_port}...")
    print(f"Data akan disimpan di: {nama_file}")
    print("Tekan Ctrl+C untuk menghentikan perekaman.\n")
    
    # Membuka/membuat file CSV
    with open(nama_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        
        # Menulis Header Kolom dari Python
        writer.writerow(["Waktu_Laptop", "Waktu_Boot_ESP32_ms", "Ketinggian_m", "Pitch_deg", "Roll_deg"])
        
        while True:
            if ser.in_waiting > 0:
                # Membaca baris data dari ESP32
                line = ser.readline().decode('utf-8').strip()
                
                # Mengabaikan baris header bawaan dari ESP32 agar tidak masuk sebagai data
                if "Waktu_ms" in line:
                    continue
                
                if line:
                    # Memisahkan string berdasarkan tanda koma menjadi list
                    data_row = line.split(',')
                    
                    # Mengambil waktu saat ini di laptop (Format: Tahun-Bulan-Tanggal Jam:Menit:Detik)
                    waktu_sekarang = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    
                    # Menyisipkan waktu_sekarang ke urutan paling awal (index 0) dari data
                    data_row.insert(0, waktu_sekarang)
                    
                    print(f"Menerima: {data_row}")
                    
                    # Menulis baris data lengkap dengan waktu ke dalam file CSV
                    writer.writerow(data_row)
                    file.flush() # Memastikan data langsung tersimpan di harddisk
                    
except KeyboardInterrupt:
    print("\nPerekaman selesai. File berhasil disimpan!")
except Exception as e:
    print(f"\nTerjadi kesalahan: {e}")