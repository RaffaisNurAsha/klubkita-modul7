

// Di halaman konfirmasi RSVP: kalau pilihannya "tidak hadir", tombol "Simpan ke Kalender" disembunyikan.
document.addEventListener('DOMContentLoaded', function () {
  const navAksi = document.querySelector('nav[aria-label="Aksi setelah RSVP"]');
  if (!navAksi) return;

  let status = new URLSearchParams(window.location.search).get('status_kehadiran');
  if (!status) {
    try {
      status = JSON.parse(sessionStorage.getItem('last_rsvp') || '{}').status_kehadiran;
    } catch (err) {
      status = null;
    }
  }
  if (status !== 'tidak_hadir') return;

  // tombol kalender = link ke Google Calendar, kalau tidak ketemu pakai paragraf pertama
  const tautanKalender = navAksi.querySelector('a[href*="calendar.google"]');
  const pembungkus = tautanKalender ? tautanKalender.closest('p') : navAksi.querySelector('p');
  if (pembungkus) pembungkus.style.display = 'none';
});
