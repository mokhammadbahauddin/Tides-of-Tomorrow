# 🎤 Naskah Responsi: "Tides of Tomorrow"
*Dokumen ini adalah naskah (*script*) yang dirancang khusus untuk Anda baca atau jadikan panduan saat mempresentasikan draf/purwarupa (`responsi_prototype.html`) di depan dosen atau juri minggu depan.*

---

## 1. Pembukaan & Filosofi Judul (Title & Storyline)
**[Tampilkan bagian Hero Section di Purwarupa]**

"Selamat pagi/siang Bapak/Ibu dosen. Hari ini saya ingin mempresentasikan draf rancangan visualisasi data saya untuk Pacific Dataviz Challenge 2026. Proyek ini saya beri judul **'Tides of Tomorrow'** (Pasang Surut Hari Esok). 

Alasan saya memilih judul ini adalah karena saya ingin mengambil sudut pandang **Ketidakadilan Iklim (Climate Injustice)**. Proyek ini bukan sekadar pameran angka yang optimis; ini adalah sebuah peringatan. Negara-negara Pasifik (22 PICTs) secara kolektif menyumbang kurang dari **0.03%** emisi karbon global. Namun, merekalah yang pertama tenggelam. 

*Storyline* proyek ini sengaja dirancang untuk menceritakan ironi yang sangat blak-blakan: bahwa masyarakat Pasifik harus kehilangan rumah, gagal panen, bahkan membayar pajak dari sisa uang mereka sendiri demi bertahan hidup dari krisis yang diciptakan oleh negara-negara industri besar."

---

## 2. Pemilihan Kategori: Interactive (Scrollytelling) vs Static
**[Gulir perlahan dari Act 1 ke Act 2]**

"Untuk lomba ini, saya memilih untuk membangun karya di kategori **Interactive Data Visualization** dengan format *Scrollytelling* (bercerita sambil menggulir halaman), daripada sekadar Poster Statis. 

Alasan utamanya adalah **Kausalitas (Hubungan Sebab-Akibat)**. Perubahan iklim adalah sebuah reaksi berantai. Poster statis sangat terbatas untuk menjelaskan bagaimana Laut yang Memanas berujung pada Gagal Panen. Dengan format *Scrollytelling*, audiens akan saya paksa untuk mengikuti urutan logis kejadiannya—mulai dari penyebab ekologis di awal, hingga dampak kemanusiaannya di akhir. Ini membangun simpati dan empati yang jauh lebih kuat dibanding melihat grafik acak di sebuah poster diam."

---

## 3. Pemilihan Dataset (Rantai Kerusakan)
**[Tunjukkan Act 2, Act 3, Act 5, dan Act 6 secara berurutan]**

"Dari ratusan dataset yang ada di *Pacific Data Hub* (PDH.Stat), saya sengaja menyeleksi **5 dataset utama**. Pemilihan ini didasarkan pada dua alasan kuat:

1. **Alasan Teknis (Integritas Data):** Kelima dataset ini (Suhu, Laut, Curah Hujan, Hasil Panen, dan Pajak) memiliki rentang waktu *time-series* historis yang paling konsisten sejak dekade 90-an, sehingga nantinya bisa digabungkan tanpa menghasilkan data silang yang rusak (*missing values*).
2. **Alasan Naratif (Chain of Destruction):** Kelima data ini mewakili sebuah cerita yang utuh. Tiga dataset pertama mewakili **Penyebab Ekologis** (Anomali Suhu Permukaan Laut, Kenaikan Level Laut, Anomali Hujan). Dua dataset terakhir mewakili **Dampak ke Manusia yang Membumi** (Penurunan Hasil Panen Talas/Taro, dan Kenaikan Pajak Lingkungan). Ini mengubah angka iklim yang tadinya abstrak menjadi realita ekonomi yang membumi."

---

## 4. Penjelasan Draft Visualisasi Data (Prototype)
**[Gulir ke Act 7: Connecting the Crises]**

"Seperti yang Bapak/Ibu lihat pada purwarupa (*prototype*) saya saat ini, saya sengaja membuat format *Mid-Fidelity Wireframe*. Artinya, struktur teks cerita (kiri) dan letak grafik (kanan) sudah final. 

Namun untuk grafiknya sendiri, saya masih menggunakan *placeholder* kotak garis putus-putus (*dashed lines*). Ini karena saya sedang membangun kodenya secara bertahap. 

Nantinya di produk akhir (Final Build):
- Kotak-kotak ini akan digantikan oleh grafik **D3.js** murni yang presisi.
- Di bagian latar belakang akan ada objek **3D WebGL** yang interaktif.
- Dan di Act ke-7 ini, akan ada fitur pamungkas bernama **Synthesis Explorer**, sebuah diagram tebar (*Scatterplot*) interaktif yang memungkinkan juri menumpuk (*overlay*) Metrik Ekologi (seperti Suhu) melawan Metrik Manusia (seperti Pajak) menggunakan *timeline slider*. Fitur inilah yang akan membuktikan secara matematis bahwa krisis ini saling terhubung."

"Demikian rancangan proyek *Tides of Tomorrow*. Terima kasih."

---
*(Catatan: Anda bisa membuka file `responsi_prototype.html` di browser biasa dan melakukan presentasi sambil membaca panduan di atas!)*
