// nama: Raffais Nur Asha
// NIM: 3420240013

// Menampilkan daftar notifikasi di halaman 07-reminder-notifikasi.html.
// Datanya datang dari js/navbar.js dan berubah langsung kalau ada pendaftaran baru.
(function () {
  const section = document.querySelector('section[aria-labelledby="notifikasi-klubkita"]');
  const statusEl = document.getElementById('status-notifikasi');
  const aksiEl = document.getElementById('aksi-notifikasi');
  const tombolTandai = document.getElementById('tandai-semua');
  if (!section || !statusEl) return;

  const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  let sudahAdaKabar = false;

  // "Jumat, 25 Sep - 16:00 (H-1)"
  function judulWaktu(n) {
    const w = n.waktu;
    const jam = String(w.getHours()).padStart(2, '0');
    const menit = String(w.getMinutes()).padStart(2, '0');
    return `${NAMA_HARI[w.getDay()]}, ${w.getDate()} ${NAMA_BULAN[w.getMonth()]} - ${jam}:${menit} (${n.label})`;
  }

  // tujuan saat notifikasi diklik: halaman tiket RSVP untuk kegiatan itu
  function tautanTiket(n) {
    const params = new URLSearchParams({
      status_kehadiran: n.status || 'hadir',
      id: n.kegiatanId,
      tiket: n.rsvpId,
    });
    return `06-konfirmasi-rsvp.html?${params.toString()}`;
  }

  function buatKartu(n, belumDibaca) {
    const kartu = document.createElement('article');
    if (belumDibaca) kartu.dataset.baru = 'true';
    const tujuan = tautanTiket(n);
    kartu.classList.add('notif-bisa-diklik');

    const waktu = document.createElement('h2');
    waktu.textContent = judulWaktu(n);

    const logo = document.createElement('img');
    logo.src = './assets/images/klubkita-logo.webp';
    logo.alt = 'Logo KlubKita';

    // tautan sungguhan di judul supaya bisa dipakai keyboard dan pembaca layar
    const judul = document.createElement('h3');
    const tautan = document.createElement('a');
    tautan.href = tujuan;
    tautan.textContent = n.judul;
    judul.append(tautan);

    const pesan = document.createElement('p');
    pesan.textContent = n.pesan;

    kartu.append(waktu, logo, judul, pesan);

    // seluruh kartu bisa diklik, bukan hanya judulnya
    kartu.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // klik pada tautan dikerjakan browser
      window.location.href = tujuan;
    });
    return kartu;
  }

  function tampilkanStatus(pesan, aksi) {
    statusEl.textContent = pesan;
    if (aksi) {
      statusEl.append(' ');
      if (aksi.href) {
        const tautan = document.createElement('a');
        tautan.href = aksi.href;
        tautan.textContent = aksi.label;
        statusEl.append(tautan);
      } else {
        const tombol = document.createElement('button');
        tombol.type = 'button';
        tombol.textContent = aksi.label;
        tombol.addEventListener('click', aksi.jalankan);
        statusEl.append(tombol);
      }
    }
  }

  function gambar() {
    const data = window.KlubKitaNotif
      ? window.KlubKitaNotif.ambil()
      : { status: 'gagal', daftar: [], dibaca: new Set() };

    section.querySelectorAll(':scope > article').forEach((a) => a.remove());
    aksiEl.hidden = true;

    if (data.status === 'memuat') {
      tampilkanStatus('Memuat notifikasi...');
      return;
    }

    if (data.status === 'belum-masuk') {
      tampilkanStatus('Masuk dulu untuk melihat notifikasi kamu.', { label: 'Masuk', href: '12-login.html' });
      return;
    }

    if (data.status === 'gagal') {
      tampilkanStatus('Gagal memuat notifikasi. Periksa koneksi internet kamu.', {
        label: 'Coba lagi',
        jalankan: () => {
          tampilkanStatus('Memuat notifikasi...');
          if (window.KlubKitaNotif) window.KlubKitaNotif.muatUlang();
        },
      });
      return;
    }

    if (data.daftar.length === 0) {
      tampilkanStatus('Belum ada notifikasi. Ikuti kegiatan lewat RSVP, nanti pengingatnya muncul di sini.');
      return;
    }

    const belumDibaca = data.daftar.filter((n) => !data.dibaca.has(n.id)).length;
    statusEl.textContent = belumDibaca > 0 ? `${belumDibaca} notifikasi baru.` : '';
    aksiEl.hidden = belumDibaca === 0;
    data.daftar.forEach((n) => section.append(buatKartu(n, !data.dibaca.has(n.id))));
  }

  window.addEventListener('klubkita:notifikasi', () => {
    sudahAdaKabar = true;
    gambar();
  });

  tombolTandai.addEventListener('click', () => {
    if (window.KlubKitaNotif) window.KlubKitaNotif.tandaiSemuaDibaca();
  });

  // notifikasi yang sudah dilihat dianggap terbaca saat halaman ditinggalkan
  window.addEventListener('pagehide', () => {
    if (window.KlubKitaNotif) window.KlubKitaNotif.tandaiSemuaDibaca();
  });

  tampilkanStatus('Memuat notifikasi...');
  aksiEl.hidden = true;

  // kalau menu navigasi tidak kunjung siap, jangan biarkan "Memuat..." selamanya
  setTimeout(() => {
    if (!sudahAdaKabar) {
      tampilkanStatus('Gagal memuat notifikasi. Periksa koneksi internet kamu.', {
        label: 'Muat ulang halaman',
        jalankan: () => window.location.reload(),
      });
    }
  }, 8000);
})();
