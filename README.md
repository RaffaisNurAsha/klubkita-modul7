# KlubKita - Prototipe Web Interaktif (Modul 7)

# Link Figma : https://www.figma.com/design/AJz4e4tXJy5u0RG2FVgoix/wireframe?node-id=59-38&t=9RhrbOdojJLd97fV-0

## Tentang Proyek

KlubKita adalah proyek aplikasi berbasis web yang berfokus pada komunitas olahraga nonprofesional. Proyek ini bertujuan membantu pengguna memperoleh informasi mengenai kegiatan, jadwal, dan pendaftaran acara olahraga komunitas.

> [!NOTE]
> **Pembaruan Halaman Baru:**
> Telah ditambahkan halaman baru yaitu **`11-tentang.html` (Halaman Tentang)**. Halaman ini merupakan penambahan yang sebelumnya **tidak terdapat di Modul 5** (Modul 5 sebelumnya hanya mencakup halaman 01–10). Halaman ini memuat informasi profil platform KlubKita, statistik, visi misi, serta transparansi kegiatan komunitas.

## Tanggung Jawab Anggota 2

Anggota 2 bertanggung jawab pada bagian tampilan antarmuka website, meliputi:

- Mengembangkan dan menyesuaikan styling CSS berdasarkan desain Figma.
- Mengatur warna, tipografi, ukuran elemen, jarak, tombol, dan tata letak halaman.
- Memastikan gambar dan aset visual ditampilkan dengan benar.
- Mengupayakan tampilan yang responsif pada berbagai ukuran layar.
- Memeriksa konsistensi tampilan antarhalaman.

## Struktur Proyek

```text
klubkita-modul7/
├── 01-beranda.html
├── 02-kalender-event.html
├── 03-kalender-terfilter.html
├── 04-detail-event.html
├── 05-form-rsvp.html
├── 06-konfirmasi-rsvp.html
├── 07-reminder-notifikasi.html
├── 08-data-tidak-ditemukan.html
├── 09-kuota-penuh.html
├── 10-gagal-simpan-rsvp.html
├── 11-tentang.html                 # [BARU] Halaman Tentang (tidak terdapat di Modul 5)
├── css/
│   └── style.css
├── js/
│   └── interaksi.js
└── assets/
    └── images/
        ├── badminton.webp
        ├── basket-sore.webp
        ├── basket.webp
        ├── futsal.webp
        ├── jogging.webp
        ├── klubkita-logo.webp
        ├── peta-tifosi.webp
        ├── qr-code-rsvp.webp
        └── voli.webp
```

## Pembagian Peran dan Kontribusi Anggota

### Anggota 1 - Raffais Nur Asha (GitHub: [RaffaisNurAsha](https://github.com/RaffaisNurAsha)) - Integrasi
- **Tugas**: menghubungkan halaman HTML, mengelola integrasi GitHub, dan menggabungkan hasil pekerjaan anggota.
- **Kontribusi**:
  - Menginisialisasi repositori dan fondasi halaman HTML Modul 6 (`01-beranda.html` s.d. `10-gagal-simpan-rsvp.html`), aset gambar di `assets/images/`, serta berkas pendukung awal (Commit `14992f5`).
  - Menghubungkan navigasi antarhalaman dan menyelaraskan pemanggilan aset bersama pada seluruh halaman HTML (`01-beranda.html` s.d. `10-gagal-simpan-rsvp.html`) (Commit `885c334`, PR #1).
  - Mengelola integrasi repositori GitHub dan menggabungkan branch fitur anggota tim ke branch `main`, meliputi merge PR #1 (`d70e1e1`), merge PR #2 (`942fe53`), dan merge PR #5 (`fa258b0`).
  - Menambahkan halaman baru `11-tentang.html` beserta pembaruan tautan navigasi di file `01` s.d. `10` dan penambahan styling pada `css/style.css` (Commit `8e4039b`, PR #6).
  - Memperbarui dokumentasi `README.md` terkait penambahan halaman baru `11-tentang.html` (Commit `79009d9`).

### Anggota 2 - Muhammad Irsyadi Aziz (GitHub: [lrsyadiaziz](https://github.com/lrsyadiaziz), [syaadby-lang](https://github.com/syaadby-lang)) - Tampilan/CSS
- **Tugas**: mengerjakan styling, menyesuaikan desain dengan Figma, dan membuat tampilan responsif.
- **Kontribusi**:
  - Menginisialisasi dan membangun styling dasar antarmuka website KlubKita pada file `css/style.css` berdasarkan referensi desain wireframe/Figma (Commit `04a0c46`, `59b2231`).
  - Memperbarui dan menyempurnakan styling CSS tata letak beranda KlubKita pada `css/style.css` (Commit `1978513`).
  - Mengembangkan tampilan visual dan penyesuaian responsivitas pada halaman HTML `01-beranda.html` s.d. `10-gagal-simpan-rsvp.html` serta sinkronisasi aset gambar di `assets/images/` melalui PR #3 (Commit `43a130d`).
  - Menulis dan memperbarui dokumentasi teknis tampilan serta status pengerjaan CSS di `README.md` pada branch `anggota-2-tampilan` (Commit `8f14020`).
  - Inisialisasi awal file `README.md` (Commit `9c4d174`) <!-- PERLU KONFIRMASI --> dan penggabungan merge PR #3 ke `main` (Commit `00a4b8e`) <!-- PERLU KONFIRMASI --> oleh author `Muhammad Irsyadi Aziz` (akun email `syaadby@iCloud.com`).

### Anggota 3 - Muhammad Rifqi Hidayat (GitHub: [Rifqi0020](https://github.com/Rifqi0020)) - JavaScript/Interaksi
- **Tugas**: mengerjakan fitur dinamis seperti filter event, validasi form RSVP, dan interaksi lainnya.
- **Kontribusi**:
  - Mengembangkan fitur filter event interaktif di halaman `03-kalender-terfilter.html` menggunakan pencocokan atribut `data-olahraga`, `data-hari`, dan `data-lokasi` pada elemen `<article>` di `js/interaksi.js` (Commit `fef8848`, PR #2).
  - Menghubungkan form filter di halaman `02-kalender-event.html` ke halaman `03-kalender-terfilter.html` melalui pembacaan parameter URL query string (`URLSearchParams`) di `js/interaksi.js` (Commit `03dc782`, PR #5).
  - Menyeragamkan opsi dropdown Hari (pilihan "Semua" dan "Senin" sampai "Minggu") serta sinkronisasi form filter pada `02-kalender-event.html` dan `03-kalender-terfilter.html` (Commit `03dc782`, PR #5).
  - Menerapkan validasi form RSVP di `05-form-rsvp.html` untuk field nama lengkap, nomor WhatsApp (format 08xx, 10–15 digit), status kehadiran, dan checkbox persetujuan dengan tampilan pesan error dinamis (`<small class="pesan-error">`) di `js/interaksi.js` (Commit `d0b1e1f`, PR #2).
  - Mengembangkan tampilan dinamis pada halaman konfirmasi RSVP `06-konfirmasi-rsvp.html` yang menyesuaikan pilihan Hadir/Tidak Hadir (mengubah judul/deskripsi konfirmasi serta menyembunyikan kode tiket, QR code, tombol simpan kalender, dan reminder jika status "Tidak Hadir") di `js/interaksi.js` (Commit `d0b1e1f`, `03dc782`).
  - Mengatur arsitektur script interaktivitas proyek, memindahkan file script ke folder `js/interaksi.js`, menyesuaikan path pemanggilan script di dokumen HTML (Commit `820ff23`, `4c59b04`, `dd721d6`).

Kelompok terdiri dari 3 anggota. Pengujian dan dokumentasi dikerjakan bersama oleh seluruh anggota.

## Teknologi yang Digunakan

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Git dan GitHub
- Figma sebagai referensi desain antarmuka

## Cara Menjalankan Website

1. Buka folder proyek `klubkita-modul7` di Visual Studio Code.
2. Buka file `01-beranda.html` atau halaman lainnya seperti `11-tentang.html`.
3. Jalankan menggunakan ekstensi Live Server atau buka file HTML melalui browser.
4. Pastikan file CSS, JavaScript, dan aset gambar dapat dimuat dengan benar.

## Branch Pengembangan

Branch: `anggota-2-tampilan`

Branch ini digunakan untuk menyimpan dan mengembangkan pekerjaan pada bagian tampilan/CSS sebelum perubahan diintegrasikan ke branch utama (`main`).

## Status Pekerjaan

- [x] File halaman HTML 01–10 tersedia pada branch ini.
- [x] Penambahan halaman baru `11-tentang.html` (Halaman Tentang yang tidak ada di Modul 5).
- [x] Aset gambar tersedia pada folder `assets/images/`.
- [x] Styling CSS tersimpan pada `css/style.css`.
- [x] Script interaktivitas tersimpan pada `js/interaksi.js`.
- [ ] Pengecekan akhir kesesuaian tampilan dengan desain Figma.
- [ ] Pengujian responsivitas pada berbagai ukuran layar.
- [ ] Integrasi perubahan ke branch utama setelah proses pemeriksaan tim.

## Catatan & Penambahan Fitur

- **Halaman Baru (`11-tentang.html`):** Halaman Tentang baru saja ditambahkan ke dalam proyek. Halaman ini **tidak terdapat di Modul 5** dan dibuat untuk menyediakan pusat informasi profil KlubKita, statistik platform, dan perkenalan komunitas olahraga.
- Perubahan pada branch ini perlu diperiksa dan dikoordinasikan dengan anggota tim sebelum digabungkan ke branch `main` agar tidak terjadi konflik atau duplikasi pekerjaan.

