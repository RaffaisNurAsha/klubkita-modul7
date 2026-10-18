# Prompt Log - Modul 7 KlubKita

- Info singkat: AI tool yang dipakai: antigravity

### 1. Struktur HTML Semantik dan Navigasi Dasar
- Judul: Pembuatan fondasi HTML semantik halaman 01-10 dan integrasi navigasi
- Anggota: RaffaisNurAsha (Anggota 1)
- Tanggal: 14 Oktober 2026
- prompt: Buatkan kerangka HTML5 semantik untuk halaman 01 sampai 10 proyek KlubKita tanpa CSS sesuai wireframe Modul 6, hubungkan link navigasi antarhalaman serta path gambar, dan pastikan lolos validasi W3C.
- Hasil: Terbentuk file 01-beranda.html sampai 10-gagal-simpan-rsvp.html dengan tag semantik, keterhubungan link navigasi, dan aset gambar webp di folder assets/images/.

### 2. Styling Tampilan CSS Halaman KlubKita
- Judul: Penerapan styling antarmuka dengan CSS
- Anggota: Muhammad Irsyadi Aziz / Irsyadiaziz (Anggota 2)
- Tanggal: 15-16 Oktober 2026
- prompt: Buatkan styling css/style.css untuk halaman web KlubKita mengacu pada desain Figma, meliputi warna, kartu kegiatan, form, tombol, dan layout responsif.
- Hasil: File css/style.css dibuat dan dilengkapi untuk styling komponen halaman 01-10, serta dokumentasi tugas tampilan pada README.md.

### 3. Fitur Filter Event Kalender
- Judul: Implementasi interaksi filter event di sisi klien
- Anggota: Muhammad Rifqi / Rifqi0020 (Anggota 3)
- Tanggal: 15 Oktober 2026
- prompt: Buatkan script JavaScript untuk memfilter daftar kartu event di 03-kalender-terfilter.html berdasarkan olahraga, hari, dan lokasi tanpa reload halaman, serta perbarui status filter aktif.
- Hasil: File interaksi.js di assets/js/ dengan event listener submit/reset form untuk menyaring artikel event dan memperbarui teks info filter.

### 4. Validasi Form RSVP dan Tampilan Konfirmasi Dinamis
- Judul: Logika validasi formulir RSVP dan penyesuaian halaman konfirmasi
- Anggota: Muhammad Rifqi / Rifqi0020 (Anggota 3)
- Tanggal: 15 Oktober 2026
- prompt: Tambahkan validasi JavaScript pada form RSVP di 05-form-rsvp.html dan ubah elemen tampilan 06-konfirmasi-rsvp.html sesuai status kehadiran (hadir atau tidak hadir).
- Hasil: Validasi input form RSVP serta penyesuaian tampilan konfirmasi (penyembunyian QR code dan penyesuaian tombol jika tidak hadir).

### 5. Penataan Ulang Lokasi Script Interaksi
- Judul: Pemindahan interaksi.js ke folder js dan perapian tag script
- Anggota: Rifqi0020 (Anggota 3)
- Tanggal: 16 Oktober 2026
- prompt: Pindahkan file interaksi.js dari assets/js/ ke folder js/, rapikan pemanggilan tag script di halaman yang membutuhkannya, dan hapus sisa pemanggilan yang tidak dipakai.
- Hasil: File berpindah ke js/interaksi.js, path script pada 03, 05, dan 06 diperbarui ke js/interaksi.js.

### 6. Perbaikan Tag HTML Halaman Kalender Terfilter
- Judul: Perbaikan sintaks tag pembuka html yang rusak
- Anggota: Rifqi0020 (Anggota 3)
- Tanggal: 18 Oktober 2026
- prompt: Perbaiki tag html yang rusak atau typo pada baris pertama file 03-kalender-terfilter.html.
- Hasil: Tag `< lang="id">` diperbaiki menjadi `<html lang="id">`.

### 7. Penyelarasan Form Filter Event dan Tombol Konfirmasi
- Judul: Sinkronisasi filter 02 dan 03, pembacaan parameter URL, dan penataan tombol
- Anggota: Rifqi0020 (Anggota 3)
- Tanggal: 18 Oktober 2026
- prompt: Samakan form filter di 02-kalender-event.html dan 03-kalender-terfilter.html memakai dropdown hari, baca query URL dari halaman 02, filter berbasis data-attribute, dan rapikan tombol tidak hadir di halaman 06 agar memenuhi lebar penuh.
- Hasil: Dropdown hari dan opsi olahraga sinkron di kedua halaman, interaksi.js membaca parameter URL, filter memakai data-* attribute, dan tombol kembali beranda diatur grid-column 1 / -1 saat tidak hadir.

### 8. Penambahan Halaman Tentang KlubKita
- Judul: Penambahan halaman 11-tentang.html dan update navigasi global
- Anggota: RaffaisNurAsha (Anggota 1)
- Tanggal: 18 Oktober 2026
- prompt: Buat halaman baru 11-tentang.html untuk profil KlubKita yang sebelumnya tidak ada di Modul 5, tambahkan link Tentang di navigasi semua halaman 01-10, tambahkan CSS-nya di style.css, dan perbarui README.md.
- Hasil: File 11-tentang.html selesai dibuat beserta styling di css/style.css, link navbar di halaman 01-10 dilengkapi, dan README.md diperbarui.

## Catatan Perbaikan

| Tanggal | Masalah | Perbaikan | Oleh Siapa |
| --- | --- | --- | --- |
| 2026-10-15 | File halaman HTML 01-10 dan gambar sempat terhapus saat pengerjaan CSS di branch tampilan | Mengembalikan (restore) seluruh file HTML dan aset gambar webp ke repo, lalu memperbarui style.css | Irsyadiaziz |
| 2026-10-16 | File interaksi.js berada di assets/js/ sehingga kurang sesuai struktur direktori js/ | Memindahkan file ke js/interaksi.js dan memperbarui path tag script pada halaman 03, 05, dan 06 | Rifqi0020 |
| 2026-10-18 | Tag pembuka html di 03-kalender-terfilter.html rusak menjadi `< lang="id">` | Memperbaiki tag menjadi `<html lang="id">` | Rifqi0020 |
| 2026-10-18 | Filter hari sempat diubah jadi input type="date" sehingga tidak cocok dengan halaman 02, opsi olahraga belum lengkap, dan tombol tidak hadir di halaman 06 posisinya sempit | Mengubah filter hari jadi select dropdown, menambah opsi olahraga, menyaring artikel lewat data-attribute, membaca parameter URL, dan mengatur tombol kembali beranda memenuhi lebar penuh (grid-column 1 / -1) | Rifqi0020 |
| 2026-10-18 | Belum tersedia halaman profil tentang KlubKita dan tautan navigasi belum mengarah ke halaman tentang | Membuat 11-tentang.html, menambahkan aturan styling di css/style.css, menambahkan link Tentang pada header/nav di halaman 01-10, dan memperbarui dokumentasi README.md | RaffaisNurAsha |
