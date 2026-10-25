# KlubKita - Data Dinamis & Logika Aplikasi (Modul 8)

**Link Figma:** https://www.figma.com/design/AJz4e4tXJy5u0RG2FVgoix/wireframe?node-id=59-38&t=9RhrbOdojJLd97fV-0

## Link Live Web

[isi link deploy]

---

## Tentang Proyek

KlubKita adalah platform web komunitas olahraga nonprofesional yang dirancang untuk mempermudah anggota mencari kegiatan olahraga, melihat detail jadwal dan lokasi, mendaftar kegiatan (RSVP), mengelola profil akun, serta menerima pengingat jadwal kegiatan secara tepat waktu.

> [!NOTE]
> **Pembaruan Halaman Baru:**
> Halaman **`11-tentang.html` (Halaman Tentang)** merupakan penambahan dari Modul 7 yang sebelumnya **tidak terdapat di Modul 5** (Modul 5 hanya mencakup halaman 01–10). Halaman ini memuat informasi profil platform KlubKita, statistik, visi misi, serta transparansi kegiatan komunitas.

---

## Sumber Data dan Layanan Backend (Supabase)

Proyek KlubKita menggunakan layanan **Supabase** sebagai platform Backend-as-a-Service (BaaS) yang mencakup basis data relasional, autentikasi pengguna, penyimpanan berkas, dan pembaruan data waktu nyata (realtime).

### 1. Layanan yang Digunakan
- **Database (PostgreSQL):** Menyimpan master data kegiatan olahraga komunitas dan transaksi pendaftaran peserta (RSVP).
- **Authentication (Supabase Auth):** Mengelola pendaftaran akun baru (`signUp`), autentikasi masuk pengguna (`signInWithPassword`), manajemen sesi aktif (`getSession`), pembaruan metadata profil (`updateUser`), dan keluar sistem (`signOut`).
- **Storage:** Bucket penyimpanan publik `avatars` untuk menampung berkas foto profil pengguna.
- **Realtime:** Saluran WebSocket Postgres Changes (`db.channel`) pada tabel pendaftaran untuk memperbarui lonceng notifikasi pengingat kegiatan secara instan saat terjadi penambahan atau perubahan status pendaftaran.

### 2. Tabel dan Kolom yang Digunakan

| Sumber Data | Nama Tabel / Bucket | Kolom yang Digunakan | Keterangan |
| :--- | :--- | :--- | :--- |
| **Database** | `kegiatan` | `id`, `judul`, `judul_detail`, `kategori`, `tanggal`, `jam_mulai`, `jam_selesai`, `lokasi`, `alamat`, `kuota`, `deskripsi`, `deskripsi_lengkap`, `gambar_url`, `yang_dibawa`, `peta_url`, `maps_url`, `penyelenggara`, `kontak` | Menyimpan seluruh data agenda kegiatan olahraga, jadwal, lokasi, kuota peserta, dan informasi kontak penyelenggara. |
| **Database** | `pendaftaran` | `id`, `kegiatan_id`, `user_id`, `nama_lengkap`, `nomor_whatsapp`, `status_kehadiran`, `catatan`, `created_at` | Menyimpan transaksi pendaftaran RSVP peserta yang berelasi dengan `kegiatan.id` dan `auth.users.id`. |
| **Storage** | `avatars` | Jalur penyimpanan: `{user_id}/avatar` | Menampung foto avatar profil pengguna dengan batasan ukuran maksimal 1 MB dan format berkas `image/jpeg`, `image/png`, atau `image/webp`. |
| **Auth** | `auth.users` | `id`, `email`, `user_metadata` (`nama_lengkap`, `nama_panggilan`, `gender`, `alamat`, `avatar_url`) | Data akun pengguna terdaftar beserta metadata profil tambahan. |

### 3. Arsitektur Berkas JavaScript (`js/`)

- `js/supabase-client.js`: Menginisialisasi client koneksi Supabase (`createClient`) menggunakan URL proyek dan kunci publik.
- `js/beranda.js`: Mengambil 6 kegiatan terdekat mendatang dari tabel `kegiatan` secara dinamis pada halaman `01-beranda.html` dengan state loading dan error handling.
- `js/detail.js`: Memuat informasi lengkap suatu kegiatan berdasarkan ID dari URL (`04-detail-event.html?id=N`), menghitung sisa kuota dari tabel `pendaftaran`, dan menonaktifkan tombol RSVP jika kuota penuh.
- `js/interaksi.js`: Menangani logika interaktif inti aplikasi:
  - Pencarian dan penyaringan event multi-kriteria (kata kunci, kategori, hari, dan lokasi) dari database pada `02-kalender-event.html` dan `03-kalender-terfilter.html`.
  - Formulir RSVP pada `05-form-rsvp.html`: membaca ID kegiatan dinamis dari URL, memuat data header event, validasi 4 input formulir, mencegah pendaftaran ganda, serta mengirim data ke tabel `pendaftaran`.
  - Penyesuaian tampilan halaman konfirmasi `06-konfirmasi-rsvp.html` berdasarkan status kehadiran (Hadir/Tidak Hadir), kode tiket dinamis, dan pembaruan nama kegiatan.
  - Penyelarasan tautan dinamis berparameter ID kegiatan pada halaman `09-kuota-penuh.html` dan `10-gagal-simpan-rsvp.html`.
- `js/navbar.js`: Mengatur navigasi dinamis: status login pengguna, menu avatar profil, tombol keluar, kalkulasi pengingat otomatis (H-1 dan 1 jam sebelum kegiatan), badge jumlah notifikasi belum dibaca, dan langganan Supabase Realtime.
- `js/notifikasi.js`: Merender daftar notifikasi pengingat kegiatan pada `07-reminder-notifikasi.html` beserta status penandaan dibaca di penyimpanan lokal (`localStorage`).
- `js/profil.js`: Mengelola data profil pengguna pada `14-profil.html`: pengisian form profil, upload/hapus foto avatar ke Supabase Storage, melihat riwayat kegiatan yang diikuti, serta pembatalan RSVP.
- `js/dialog.js`: Komponen modal dialog konfirmasi interaktif berbasis elemen HTML5 `<dialog>` untuk konfirmasi tindakan sensitif (seperti pembatalan keikutsertaan kegiatan).
- `js/kalender.js`: Integrasi pembuatan tautan Google Calendar lengkap dengan detail acara, lokasi, dan pengingat otomatis pada halaman konfirmasi RSVP.
- `js/format.js`: Fungsi pembantu penyeragaman format tanggal bahasa Indonesia (`formatTanggal`) dan format jam WIB (`formatJam`).
- `js/ui-state.js`: Fungsi penyaji status antarmuka: indikator memuat (`tampilkanLoading`), data kosong (`tampilkanEmpty`), dan pesan kesalahan dengan tombol coba lagi (`tampilkanError`).
- `js/toast.js`: Komponen notifikasi mengambang (toast) dengan varian `info`, `success`, dan `error`.
- `js/konfirmasi.js`: Berkas helper penyesuaian tombol kalender saat status tidak hadir (logika utama telah terintegrasi di `js/interaksi.js`).
- `js/script.js`: Berkas pendukung umum aplikasi.

### 4. Keamanan Kredensial API
Repositori ini **hanya menyertakan Publishable Key (Anon Key)** pada client Supabase. Kunci ini dirancang khusus dan aman untuk berada di sisi klien (browser) karena seluruh pembatasan akses data telah dilindungi menggunakan kebijakan keamanan baris basis data (**Row Level Security / RLS**). Repositori ini **tidak memuat password basis data, Service Role Secret Key, maupun kredensial administratif rahasia lainnya**.

---

## Struktur Proyek

```text
klubkita-modul7/
├── .gitattributes
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
├── 11-tentang.html
├── 12-login.html
├── 13-register.html
├── 14-profil.html
├── README.md
├── README.txt
├── prompt-log.md
├── assets/
│   └── images/
│       ├── badminton.webp
│       ├── basket-sore.webp
│       ├── basket.webp
│       ├── futsal.webp
│       ├── jogging.webp
│       ├── klubkita-logo.webp
│       ├── peta-tifosi.webp
│       ├── qr-code-rsvp.webp
│       └── voli.webp
├── css/
│   ├── akun.css
│   └── style.css
├── js/
│   ├── beranda.js
│   ├── detail.js
│   ├── dialog.js
│   ├── format.js
│   ├── interaksi.js
│   ├── kalender.js
│   ├── konfirmasi.js
│   ├── navbar.js
│   ├── notifikasi.js
│   ├── profil.js
│   ├── script.js
│   ├── supabase-client.js
│   ├── toast.js
│   └── ui-state.js
└── validation-w3c/
    ├── 01-beranda.png
    ├── 02-kalender-event.png
    ├── 03-kalender-terfilter.png
    ├── 04-detail-event.png
    ├── 05-form-rsvp.png
    ├── 06-konfirmasi-rsvp.png
    ├── 07-reminder-notifikasi.png
    ├── 08-data-tidak-ditemukan.png
    ├── 09-kuota-penuh.png
    └── 10-gagal-simpan-rsvp.png
```

---

## Fitur yang Sudah Dinamis

Seluruh fitur di bawah ini telah diimplementasikan menggunakan kode aktif yang terhubung dengan basis data dan antarmuka pengguna:

1. **Beranda Dinamis (`01-beranda.html`)**:
   - Menampilkan hingga 6 daftar kegiatan terdekat yang akan datang langsung dari tabel `kegiatan`.
   - Dilengkapi penanganan status pemuatan data (*loading state*) dan pesan kesalahan jaringan dengan opsi coba lagi.

2. **Pencarian dan Filter Multi-Kriteria (`02-kalender-event.html` & `03-kalender-terfilter.html`)**:
   - Pencarian berbasis kata kunci pada judul kegiatan atau nama lokasi.
   - Filter dropdown kategori olahraga dan nama hari (Senin–Minggu).
   - Sinkronisasi nilai filter form melalui URL query parameters (`q`, `olahraga`, `hari`, `lokasi`).
   - Tampilan badge ringkasan filter aktif dan penanganan *empty state* jika kegiatan tidak ditemukan.

3. **Detail Kegiatan Dinamis (`04-detail-event.html`)**:
   - Mengambil data detail kegiatan berdasarkan parameter `?id=N` dari URL.
   - Menghitung sisa kuota peserta secara dinamis (`kuota` dikurangi jumlah baris di tabel `pendaftaran`).
   - Otomatis menonaktifkan/menyembunyikan tombol RSVP jika kuota kegiatan sudah terpenuhi.
   - Menampilkan daftar perlengkapan yang perlu dibawa dan tautan Google Maps.

4. **Formulir RSVP & Validasi Pendaftaran (`05-form-rsvp.html`)**:
   - Membaca ID kegiatan dari parameter URL tanpa *fallback* nilai tetap (mencegah pendaftaran event lain tersimpan sebagai Futsal).
   - Menampilkan informasi judul, tanggal, jam, dan sisa kuota kegiatan yang dipilih pada header form.
   - Validasi ketat sisi klien: Nama Lengkap (wajib isi setelah di-trim), Nomor WhatsApp (format 08xx, 10–15 digit angka), Status Kehadiran (radio pilihan), dan Persetujuan Ketentuan Komunitas (checkbox wajib).
   - Pengisian otomatis field nama apabila pengguna sedang dalam status masuk (login).
   - Deteksi pencegahan submit ganda (*double-submit protection*) dan penanganan duplikasi pendaftaran (kode error `23505`).
   - Pengalihan otomatis ke `09-kuota-penuh.html?id=N` jika kuota habis, serta ke `10-gagal-simpan-rsvp.html?id=N` jika terjadi kendala teknis database.

5. **Konfirmasi Pendaftaran Interaktif (`06-konfirmasi-rsvp.html`)**:
   - Menampilkan nama kegiatan yang didaftarkan secara dinamis dari database atau sesi penyimpanan.
   - Pembuatan kode tiket otomatis (`KLB-<id>`) berdasarkan ID pendaftaran dari Supabase.
   - Tampilan adaptif sesuai pilihan kehadiran: menyembunyikan tiket, kode QR, dan reminder jika memilih "Tidak Hadir".
   - Integrasi pembuatan jadwal ke Google Calendar (`js/kalender.js`).

6. **Autentikasi Akun Pengguna (`12-login.html` & `13-register.html`)**:
   - Pendaftaran akun baru dengan validasi panjang kata sandi minimal 8 karakter dan konfirmasi kata sandi.
   - Masuk akun menggunakan email dan kata sandi via Supabase Auth.
   - Umpan balik notifikasi toast saat proses autentikasi berhasil atau gagal.

7. **Profil Pengguna & Riwayat Kegiatan (`14-profil.html`)**:
   - Mengelola data profil: nama lengkap, nama panggilan, gender, dan alamat tempat tinggal.
   - Unggah dan hapus foto profil pengguna ke bucket Supabase Storage `avatars`.
   - Menampilkan riwayat kegiatan yang diikuti pengguna dari tabel `pendaftaran`.
   - Fitur **Batalkan RSVP** yang menghapus data dari tabel `pendaftaran` dengan konfirmasi modal dialog (`js/dialog.js`).

8. **Pengingat & Notifikasi Realtime (`07-reminder-notifikasi.html` & Navigasi)**:
   - Perhitungan pengingat otomatis jadwal kegiatan (pengingat H-1 dan H-0 satu jam sebelum mulai).
   - Indikator lonceng notifikasi pada navbar dengan lencana (*badge*) jumlah pesan belum dibaca.
   - Pembaruan notifikasi secara *realtime* saat data pendaftaran berubah melalui saluran Supabase Realtime.
   - Fitur "Tandai Semua Dibaca" dengan status tersimpan di `localStorage`.

9. **Manajemen UX State & Notifikasi Toast**:
   - Standarisasi state antarmuka pada [js/ui-state.js](file:///c:/Users/Asus/klubkita-modul7/klubkita-modul7/js/ui-state.js) untuk kondisi memuat data, data kosong, dan galat koneksi dengan tombol coba lagi.
   - Komponen toast notification pada [js/toast.js](file:///c:/Users/Asus/klubkita-modul7/klubkita-modul7/js/toast.js) untuk seluruh notifikasi interaksi pengguna.

---

## Panduan Mencoba untuk Mentor

Untuk menguji fungsionalitas aplikasi secara menyeluruh dari sisi pengguna, ikuti langkah pengujian berikut:

1. **Menjalankan Proyek Secara Lokal:**
   - Buka direktori repositori `klubkita-modul7` pada text editor Visual Studio Code.
   - Pastikan ekstensi **Live Server** telah terpasang.
   - Klik kanan pada berkas `01-beranda.html` lalu pilih **Open with Live Server** (aplikasi berjalan di `http://127.0.0.1:5500/01-beranda.html`).

2. **Melihat Kegiatan di Beranda:**
   - Periksa kartu kegiatan pada `01-beranda.html`. Data diambil langsung dari tabel `kegiatan` Supabase.

3. **Mencoba Fitur Filter & Pencarian:**
   - Navigasi ke menu **Kalender** (`02-kalender-event.html`).
   - Masukkan kata kunci pencarian (misal: "Voli" atau "Futsal"), pilih filter olahraga atau hari, lalu klik **Terapkan**.
   - Halaman akan menyaring kegiatan sesuai kriteria langsung dari basis data.

4. **Registrasi dan Masuk Akun:**
   - Buka halaman **Daftar** (`13-register.html`), isi nama lengkap, email valid, dan kata sandi minimal 8 karakter.
   - Setelah berhasil mendaftar, buka halaman **Masuk** (`12-login.html`) dan lakukan login.
   - Perhatikan navigasi atas: avatar profil dan lonceng notifikasi akan muncul menggantikan tautan Masuk/Daftar.

5. **Membuka Detail Kegiatan & Mendaftar RSVP:**
   - Buka salah satu kegiatan, misalnya event Bola Voli pada `04-detail-event.html?id=2`.
   - Klik tombol **RSVP Sekarang** untuk menuju ke `05-form-rsvp.html?id=2`.
   - Perhatikan header form telah menampilkan judul, tanggal, dan sisa kuota event yang dipilih secara dinamis.
   - Kolom nama otomatis terisi dari akun yang sedang login.
   - Isi nomor WhatsApp (contoh: `081234567890`), pilih status kehadiran, centang persetujuan, lalu klik **Kirim RSVP**.

6. **Memeriksa Konfirmasi Pendaftaran:**
   - Sistem akan mengarahkan ke `06-konfirmasi-rsvp.html` dengan parameter status dan ID kegiatan.
   - Periksa kode tiket digital (`KLB-XXXXX`) dan nama kegiatan yang sesuai.
   - Uji tombol **Simpan ke Kalender** untuk membuka formulir Google Calendar otomatis.

7. **Memeriksa Notifikasi Pengingat:**
   - Klik ikon lonceng pada navigasi atas atau buka `07-reminder-notifikasi.html`.
   - Pengingat kegiatan yang baru didaftarkan akan muncul otomatis dalam daftar.
   - Klik tombol **Tandai semua sudah dibaca** untuk mengosongkan badge belum dibaca.

8. **Mengelola Profil & Membatalkan RSVP:**
   - Klik foto avatar pengguna pada navigasi atas, lalu pilih **Profil Saya** (`14-profil.html`).
   - Ubah data profil (nama panggilan, gender, alamat) dan unggah foto avatar, lalu klik **Simpan perubahan**.
   - Pada bagian **Kegiatan yang Saya Ikuti**, kegiatan yang telah didaftarkan akan tampil.
   - Klik tombol **Batalkan RSVP**, konfirmasi pada kotak dialog interaktif, dan pastikan data pendaftaran berhasil terhapus dari tabel basis data.

---

## Alur Git dan Kolaborasi Tim

Pengembangan Modul 8 menerapkan alur Git terstruktur berbasis cabang fitur (*feature branch workflow*) untuk memastikan pekerjaan setiap anggota tim terisolasi sebelum digabungkan:

```text
main (cabang rilis utama)
  └── feed-dynamic-data (cabang integrasi data dinamis Modul 8)
        ├── anggota-1-integrasi (Database, integrasi beranda, detail, profil, dan notifikasi)
        ├── anggota-2-ux-state  (Autentikasi login/register, styling akun, UI-state, dan toast)
        └── anggota-3-fitur-form (Pencarian/filter event, logika form RSVP, dan perbaikan alur URL)
```

- **Branch Integrasi (`feed-dynamic-data`):** Digunakan sebagai titik temu integrasi fungsionalitas Supabase dan logika aplikasi sebelum perilisan akhir ke cabang `main`.
- **Branch Kerja per Anggota:**
  - `anggota-1-integrasi`: Mengelola fondasi koneksi Supabase, integrasi data beranda, detail event, sistem profil, dan notifikasi realtime.
  - `anggota-2-ux-state`: Mengembangkan halaman login/register, styling CSS formulir akun, komponen UI state, dan toast.
  - `anggota-3-fitur-form`: Mengembangkan fitur pencarian, filter kegiatan, penanganan formulir RSVP, dan perbaikan alur parameter URL antarhalaman.
- **Pull Request & Penggabungan:** Setiap anggota mengajukan Pull Request (PR) ke cabang integrasi yang ditinjau dan digabungkan secara bertahap (PR #9, PR #10, PR #11, dan PR #12).

---

## Pembagian Peran dan Kontribusi Modul 8

### Anggota 1 - Raffais Nur Asha (GitHub: [RaffaisNurAsha](https://github.com/RaffaisNurAsha)) - Database & Integrasi
- **Tugas:** Menyiapkan konfigurasi Supabase, menghubungkan data dinamis pada halaman utama, mengelola profil dan notifikasi realtime, serta mengintegrasikan alur cabang git.
- **Kontribusi Berdasarkan Bukti Commit:**
  - Menginisialisasi koneksi client Supabase pada `js/supabase-client.js` dan fungsi utilitas penyeragaman tanggal/jam pada `js/format.js` (Commit `882ac4c`).
  - Mengembangkan pemanggilan data kegiatan terdekat dari basis data pada halaman Beranda `01-beranda.html` via `js/beranda.js` (Commit `dfa6afa`).
  - Mengembangkan tampilan detail kegiatan dinamis dan kalkulasi sisa kuota peserta pada `04-detail-event.html` via `js/detail.js` (Commit `c6d543e`, `24c98f7`).
  - Mengembangkan fitur manajemen Profil Pengguna pada `14-profil.html` dan `js/profil.js`, termasuk integrasi unggah/hapus berkas foto profil ke Supabase Storage bucket `avatars` (Commit `0725a6f`).
  - Mengembangkan sistem notifikasi pengingat kegiatan otomatis (H-1 dan 1 jam sebelum kegiatan) dengan pembaruan instan menggunakan Supabase Realtime di `js/navbar.js` dan `js/notifikasi.js` (Commit `0725a6f`, `ef25ceb`).
  - Mengembangkan komponen modal dialog konfirmasi interaktif pada `js/dialog.js` dan fitur ekspor jadwal kegiatan ke Google Calendar pada `js/kalender.js` (Commit `0eac514`).
  - Mengelola integrasi cabang git dan proses merge Pull Request anggota tim ke branch `feed-dynamic-data` (Merge PR #9: `9d60bcb`, Merge PR #11: `c3b5882`, Commit `4d20a93`).

### Anggota 2 - Muhammad Irsyadi Aziz (GitHub: [lrsyadiaziz](https://github.com/lrsyadiaziz), [syaadby-lang](https://github.com/syaadby-lang)) - Tampilan & UX State
- **Tugas:** Mengembangkan antarmuka dan logika halaman autentikasi (login dan register), merancang modul tampilan status antarmuka (loading/empty/error), komponen toast, dan styling CSS akun.
- **Kontribusi Berdasarkan Bukti Commit:**
  - Membangun antarmuka formulir Masuk pada `12-login.html` dan Pendaftaran Akun pada `13-register.html` yang terhubung dengan Supabase Auth (Commit `7d5ce03`, PR #9).
  - Mengembangkan modul pengelolaan state antarmuka pengguna pada `js/ui-state.js` yang mencakup indikator memuat (`tampilkanLoading`), data kosong (`tampilkanEmpty`), dan pesan galat dengan tombol coba lagi (`tampilkanError`) (Commit `7d5ce03`, PR #9).
  - Mengembangkan komponen notifikasi pesan mengambang pada `js/toast.js` untuk menyediakan umpan balik interaksi pengguna (Commit `7d5ce03`, PR #9).
  - Mengembangkan dan menyesuaikan styling CSS halaman autentikasi dan komponen profil pada `css/akun.css` (Commit `2ae4152`, PR #11).
  - Menyetujui dan menggabungkan integrasi merge Pull Request PR #11 ke branch pengembangan utama oleh author `Muhammad Irsyadi Aziz` (Commit `c3b5882`) <!-- PERLU KONFIRMASI -->.

### Anggota 3 - Muhammad Rifqi Hidayat (GitHub: [Rifqi0020](https://github.com/Rifqi0020)) - Fitur & Form
- **Tugas:** Mengembangkan fitur pencarian dan filter kegiatan dari basis data, logika penyimpanan dan validasi formulir RSVP, serta perbaikan sinkronisasi parameter ID kegiatan antarhalaman.
- **Kontribusi Berdasarkan Bukti Commit:**
  - Mengembangkan fitur pencarian kata kunci (*search*) dan penyaringan kegiatan (*filter*) multi-kriteria berbasis Supabase pada `02-kalender-event.html` dan `03-kalender-terfilter.html` di `js/interaksi.js` (Commit `45c3b56`, PR #10).
  - Mengembangkan logika penyimpanan formulir RSVP pada `05-form-rsvp.html` ke tabel `pendaftaran` Supabase dengan validasi 4 input, proteksi submit ganda, dan penanganan kode error RLS/duplikasi pendaftaran (Commit `45c3b56`, PR #10).
  - Menghapus ketergantungan nilai tetap fallback ID kegiatan `|| 1` pada form RSVP, memastikan parameter ID dibaca dinamis dari URL, dan mengganti teks statis Futsal di header dengan data kegiatan aktual dari basis data (Commit `eaec62b`, PR #12).
  - Menyesuaikan tautan kembali "Kembali ke Detail Event" pada `05-form-rsvp.html` dan `09-kuota-penuh.html` agar membawa parameter ID kegiatan (`04-detail-event.html?id=<id>`) (Commit `eaec62b`, `10cc607`, PR #12).
  - Memperbarui tautan tombol "Ulangi Kirim RSVP" pada `10-gagal-simpan-rsvp.html` agar mengarah kembali ke `05-form-rsvp.html?id=<id>` (Commit `10cc607`, PR #12).
  - Menyertakan parameter `&id=<id>` pada alur pengalihan URL saat RSVP berhasil ke `06-konfirmasi-rsvp.html` dan memuat judul kegiatan dinamis pada tiket konfirmasi (Commit `eaec62b`, PR #12).
  - Menggabungkan merge Pull Request PR #10 (`9bb15ba`) dan PR #12 (`b67b0df`) pada branch fitur form.

---

## Catatan Perbaikan Manual

Bagian ini mencatat perbaikan teknis dan perbaikan manual yang dilakukan selama tahap pengujian dan integrasi fitur:

### Anggota 3 (Muhammad Rifqi Hidayat)
1. **Pemberian ID Kegiatan Dinamis pada Form RSVP:** Menghapus nilai *fallback* statis `|| 1` di `js/interaksi.js` yang sebelumnya membuat pendaftaran event lain (misal: Bola Voli / Basket) keliru tersimpan dan tertampil sebagai "Latihan Futsal Mingguan".
2. **Penanganan Event Tidak Ditemukan:** Jika parameter `?id=` pada URL halaman 05 kosong atau tidak valid, sistem secara otomatis menampilkan antarmuka error/empty state menggunakan [js/ui-state.js](file:///c:/Users/Asus/klubkita-modul7/klubkita-modul7/js/ui-state.js) dengan tautan kembali ke kalender event `02-kalender-event.html`, tanpa melakukan *fallback* ke event lain.
3. **Penyelarasan Tautan Antarhalaman Berparameter:**
   - Mengubah atribut `href` link "Kembali ke Detail Event" pada `05-form-rsvp.html` menjadi `04-detail-event.html?id=<id>` via JavaScript.
   - Mengubah atribut `href` link "Kembali ke Detail Event" pada `09-kuota-penuh.html` menjadi `04-detail-event.html?id=<id>`.
   - Mengubah atribut `href` tombol "Ulangi Kirim RSVP" pada `10-gagal-simpan-rsvp.html` menjadi `05-form-rsvp.html?id=<id>`.
   - Memastikan redirect berhasil menyimpan RSVP menyertakan `&id=<id>` ke `06-konfirmasi-rsvp.html`.
4. **Pembaruan Header Form Dinamis:** Menggantikan teks statis pada header `05-form-rsvp.html` dengan judul, tanggal, jam, dan sisa kuota yang diambil langsung dari database.
5. **Perbaikan Tag HTML Rusak:** Memperbaiki tag pembuka HTML yang sempat rusak pada berkas `03-kalender-terfilter.html` dari `< lang="id">` kembali menjadi `<html lang="id">`.
6. **Perapian Tampilan Konfirmasi RSVP Status Tidak Hadir:** Merapikan tata letak tombol pada `06-konfirmasi-rsvp.html` saat status "Tidak Hadir" dengan memperlebar tombol "Kembali ke Beranda" (`grid-column: 1 / -1`) serta menyembunyikan kode tiket, QR code, teks pengingat, dan tautan kalender.

### Anggota 1 (Raffais Nur Asha)
- `[Tempat catatan perbaikan manual Anggota 1]` <!-- PERLU KONFIRMASI -->

### Anggota 2 (Muhammad Irsyadi Aziz)
- `[Tempat catatan perbaikan manual Anggota 2]` <!-- PERLU KONFIRMASI -->

---

## Rangkuman Kontribusi Modul 7

Bagian ini dipertahankan sebagai dokumentasi historis pencapaian tahap Modul 7 (Prototipe Web Interaktif):

### Anggota 1 - Raffais Nur Asha (GitHub: [RaffaisNurAsha](https://github.com/RaffaisNurAsha)) - Integrasi
- Menginisialisasi repositori dan fondasi halaman HTML Modul 6 (`01-beranda.html` s.d. `10-gagal-simpan-rsvp.html`), aset gambar di `assets/images/`, serta berkas pendukung awal (Commit `14992f5`).
- Menghubungkan navigasi antarhalaman dan menyelaraskan pemanggilan aset bersama pada seluruh halaman HTML (`01-beranda.html` s.d. `10-gagal-simpan-rsvp.html`) (Commit `885c334`, PR #1).
- Mengelola integrasi repositori GitHub dan menggabungkan branch fitur anggota tim ke branch `main`, meliputi merge PR #1 (`d70e1e1`), merge PR #2 (`942fe53`), dan merge PR #5 (`fa258b0`).
- Menambahkan halaman baru `11-tentang.html` beserta pembaruan tautan navigasi di file `01` s.d. `10` dan penambahan styling pada `css/style.css` (Commit `8e4039b`, PR #6).
- Memperbarui dokumentasi `README.md` terkait penambahan halaman baru `11-tentang.html` (Commit `79009d9`).

### Anggota 2 - Muhammad Irsyadi Aziz (GitHub: [lrsyadiaziz](https://github.com/lrsyadiaziz), [syaadby-lang](https://github.com/syaadby-lang)) - Tampilan/CSS
- Menginisialisasi dan membangun styling dasar antarmuka website KlubKita pada file `css/style.css` berdasarkan referensi desain wireframe/Figma (Commit `04a0c46`, `59b2231`).
- Memperbarui dan menyempurnakan styling CSS tata letak beranda KlubKita pada `css/style.css` (Commit `1978513`).
- Mengembangkan tampilan visual dan penyesuaian responsivitas pada halaman HTML `01-beranda.html` s.d. `10-gagal-simpan-rsvp.html` serta sinkronisasi aset gambar di `assets/images/` melalui PR #3 (Commit `43a130d`).
- Menulis dan memperbarui dokumentasi teknis tampilan serta status pengerjaan CSS di `README.md` pada branch `anggota-2-tampilan` (Commit `8f14020`).
- Inisialisasi awal file `README.md` (Commit `9c4d174`) <!-- PERLU KONFIRMASI --> dan penggabungan merge PR #3 ke `main` (Commit `00a4b8e`) <!-- PERLU KONFIRMASI --> oleh author `Muhammad Irsyadi Aziz`.

### Anggota 3 - Muhammad Rifqi Hidayat (GitHub: [Rifqi0020](https://github.com/Rifqi0020)) - JavaScript/Interaksi
- Mengembangkan fitur filter event interaktif di halaman `03-kalender-terfilter.html` menggunakan pencocokan atribut data pada elemen `<article>` di `js/interaksi.js` (Commit `fef8848`, PR #2).
- Menghubungkan form filter di halaman `02-kalender-event.html` ke halaman `03-kalender-terfilter.html` melalui pembacaan parameter URL query string (`URLSearchParams`) di `js/interaksi.js` (Commit `03dc782`, PR #5).
- Menyeragamkan opsi dropdown Hari serta sinkronisasi form filter pada `02-kalender-event.html` dan `03-kalender-terfilter.html` (Commit `03dc782`, PR #5).
- Menerapkan validasi form RSVP di `05-form-rsvp.html` untuk field nama lengkap, nomor WhatsApp, status kehadiran, dan checkbox persetujuan dengan tampilan pesan error dinamis di `js/interaksi.js` (Commit `d0b1e1f`, PR #2).
- Mengembangkan tampilan dinamis pada halaman konfirmasi RSVP `06-konfirmasi-rsvp.html` yang menyesuaikan pilihan Hadir/Tidak Hadir di `js/interaksi.js` (Commit `d0b1e1f`, `03dc782`).
- Mengatur arsitektur script interaktivitas proyek, memindahkan file script ke folder `js/interaksi.js`, menyesuaikan path pemanggilan script di dokumen HTML (Commit `820ff23`, `4c59b04`, `dd721d6`).

---

## Catatan Tambahan

- Kelompok beranggotakan 3 orang. Pengujian dan dokumentasi dikerjakan bersama oleh seluruh anggota.
- Dokumentasi interaksi dan log penggunaan kecerdasan buatan (AI) dicatat pada file [prompt-log.md](prompt-log.md).

---

## Keamanan Supabase

File `js/supabase-client.js` memuat **URL proyek** dan **anon (publishable) key**. Kunci ini memang dirancang untuk dipakai di sisi klien/frontend dan aman selama **Row Level Security (RLS)** aktif di setiap tabel.

> **⚠️ PENTING:** Jangan pernah menggunakan `service_role` key di kode frontend. Kunci tersebut memiliki akses penuh melewati RLS dan hanya boleh dipakai di server/backend.

### Checklist Verifikasi RLS

Jalankan langkah berikut di **Supabase Dashboard → Authentication → Policies** untuk memastikan RLS aktif:

- [ ] Tabel `kegiatan` — RLS **Enabled** ✅
  - [ ] Policy `SELECT`: memperbolehkan semua pengguna (`anon`, `authenticated`) membaca data.
  - [ ] Policy `INSERT`/`UPDATE`/`DELETE`: hanya role tertentu atau tidak ada (readonly untuk publik).
- [ ] Tabel `pendaftaran` — RLS **Enabled** ✅
  - [ ] Policy `SELECT`: pengguna hanya dapat melihat pendaftaran miliknya sendiri (`auth.uid() = user_id`), atau sesuai kebutuhan.
  - [ ] Policy `INSERT`: pengguna terautentikasi boleh mendaftar (`auth.uid() = user_id`).
  - [ ] Policy `UPDATE`/`DELETE`: hanya pemilik data atau admin.

