
(function () {

  const ZONA = 'Asia/Jakarta'; // WIB
  const DURASI_STANDAR_JAM = 2;
  const PENGINGAT_MENIT = [1440, 60]; // 1 hari dan 1 jam sebelum kegiatan
  const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
  const API_ACARA = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function kabari(pesan, tipe, durasi) {
    if (typeof tampilkanToast === 'function') tampilkanToast(pesan, tipe, durasi);
  }

  // ---------- waktu ----------

  // "2026-11-22" + "15:00:00" -> Date lokal (hanya dipakai untuk menghitung jam selesai)
  function waktuLokal(tanggal, jam, tambahJam) {
    const [th, bl, tg] = tanggal.split('-').map(Number);
    const [jj, mm] = jam.split(':').map(Number);
    return new Date(th, bl - 1, tg, jj + (tambahJam || 0), mm);
  }

  function formatLokal(d) {
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
    );
  }

  // pasangan waktu mulai/selesai, format "2026-11-22T15:00:00" (tanpa offset)
  function rentangWaktu(k) {
    const mulai = waktuLokal(k.tanggal, k.jam_mulai);
    const selesai = k.jam_selesai
      ? waktuLokal(k.tanggal, k.jam_selesai)
      : waktuLokal(k.tanggal, k.jam_mulai, DURASI_STANDAR_JAM);
    return { mulai: formatLokal(mulai), selesai: formatLokal(selesai) };
  }

  // "2026-11-22T15:00:00" -> "20261122T150000" (format tautan Google Calendar)
  function ringkas(s) {
    return s.replace(/[-:]/g, '');
  }

  // ---------- isi acara ----------

  function namaKegiatan(k) {
    return k.judul_detail || k.judul;
  }

  function uraian(k, idTiket) {
    return [
      `Kamu terdaftar di ${namaKegiatan(k)} lewat KlubKita.`,
      idTiket ? `Kode tiket: KLB-${String(idTiket).padStart(5, '0')}` : '',
      k.maps_url ? `Peta: ${k.maps_url}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  // tautan "tambah acara" Google Calendar dengan formulir yang sudah terisi
  function tautanGoogle(k, idTiket) {
    const w = rentangWaktu(k);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: namaKegiatan(k),
      dates: `${ringkas(w.mulai)}/${ringkas(w.selesai)}`,
      ctz: ZONA,
      details: uraian(k, idTiket),
    });
    if (k.lokasi) params.set('location', k.lokasi);
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // badan permintaan untuk Google Calendar API, lengkap dengan dua pengingat
  function badanAcara(k, idTiket) {
    const w = rentangWaktu(k);
    const badan = {
      summary: namaKegiatan(k),
      description: uraian(k, idTiket),
      start: { dateTime: w.mulai, timeZone: ZONA },
      end: { dateTime: w.selesai, timeZone: ZONA },
      reminders: {
        useDefault: false,
        overrides: PENGINGAT_MENIT.map((menit) => ({ method: 'popup', minutes: menit })),
      },
    };
    if (k.lokasi) badan.location = k.lokasi;
    return badan;
  }

  // ---------- konteks halaman ----------

  // id kegiatan dan id pendaftaran: dari URL (dibuka lewat notifikasi) atau sessionStorage (RSVP baru)
  function bacaKonteks() {
    const params = new URLSearchParams(window.location.search);
    let idKegiatan = Number(params.get('id'));
    let idTiket = Number(params.get('tiket'));
    if (!idKegiatan || !idTiket) {
      try {
        const tersimpan = JSON.parse(sessionStorage.getItem('last_rsvp') || '{}');
        if (!idKegiatan && tersimpan.kegiatan_id) idKegiatan = Number(tersimpan.kegiatan_id);
        if (!idTiket && tersimpan.id) idTiket = Number(tersimpan.id);
      } catch (err) {
        // abaikan, lanjut dengan yang ada
      }
    }
    return { idKegiatan, idTiket };
  }

  // ---------- Google Calendar API (mode langsung) ----------

  function muatGoogleIdentity() {
    return new Promise((ok, gagal) => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        ok();
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = ok;
      s.onerror = gagal;
      document.head.append(s);
    });
  }

  // id acara tetap per pendaftaran: karakter hanya a-v dan 0-9 sesuai aturan Google,
  // sehingga menekan tombol dua kali tidak membuat acara ganda
  function idAcara(idTiket, idKegiatan) {
    return `klubkita${idTiket || `k${idKegiatan}`}`.toLowerCase().replace(/[^a-v0-9]/g, '');
  }

  async function kirimKeGoogle(token, k, idTiket) {
    const id = idAcara(idTiket, k.id);
    const badan = JSON.stringify({ id, ...badanAcara(k, idTiket) });
    const header = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    let res = await fetch(API_ACARA, { method: 'POST', headers: header, body: badan });
    if (res.status === 409) {
      // acara dengan id ini pernah dibuat (mungkin sudah dihapus): perbarui dan aktifkan lagi
      res = await fetch(`${API_ACARA}/${id}`, {
        method: 'PUT',
        headers: header,
        body: JSON.stringify({ ...badanAcara(k, idTiket), status: 'confirmed' }),
      });
    }
    if (!res.ok) throw new Error(`Google Calendar menolak (${res.status})`);
    return res.json();
  }

  // ---------- tombol ----------

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav[aria-label="Aksi setelah RSVP"]');
    if (!nav) return;
    const tombol = nav.querySelector('a[href*="calendar.google"]');
    if (!tombol) return;

    const { idKegiatan, idTiket } = bacaKonteks();
    const modeLangsung = Boolean(GOOGLE_CLIENT_ID);
    let kegiatan = null;
    let klienToken = null;
    let sedangProses = false;
    const teksAwal = tombol.textContent;

    tombol.target = '_blank';
    tombol.rel = 'noopener noreferrer';

    // data kegiatan dimuat di awal supaya klik langsung bekerja (tidak diblokir popup blocker)
    async function muatKegiatan() {
      if (!idKegiatan || typeof db === 'undefined') return;
      try {
        const { data, error } = await db.from('kegiatan').select('*').eq('id', idKegiatan).maybeSingle();
        if (error || !data) return;
        kegiatan = data;
        // mode tautan: tombol langsung menunjuk ke formulir Google Calendar yang sudah terisi
        tombol.href = tautanGoogle(kegiatan, idTiket);
      } catch (err) {
        // tombol tetap menuju Google Calendar biasa
      }
    }

    function bukaTautan() {
      if (kegiatan) window.open(tautanGoogle(kegiatan, idTiket), '_blank', 'noopener');
    }

    async function setelahTokenDiterima(resp) {
      if (!resp || resp.error || !resp.access_token) {
        kabari('Izin kalender tidak diberikan. Aku buka Google Calendar biasa ya.', 'info');
        bukaTautan();
        return;
      }
      tombol.textContent = 'Menyimpan...';
      try {
        await kirimKeGoogle(resp.access_token, kegiatan, idTiket);
        tombol.textContent = 'Tersimpan di Google Calendar';
        kabari('Kegiatan masuk ke Google Calendar dengan pengingat 1 hari dan 1 jam sebelumnya.', 'success', 6000);
      } catch (err) {
        tombol.textContent = teksAwal;
        kabari('Gagal menyimpan otomatis. Aku buka Google Calendar biasa ya.', 'error');
        bukaTautan();
      } finally {
        sedangProses = false;
      }
    }

    if (modeLangsung) {
      // siapkan klien OAuth lebih awal; jendela login harus dibuka dari klik pengguna
      muatGoogleIdentity()
        .then(() => {
          klienToken = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPE,
            callback: setelahTokenDiterima,
            error_callback: () => {
              sedangProses = false;
              kabari('Jendela login Google ditutup atau diblokir. Aku buka Google Calendar biasa ya.', 'info');
              bukaTautan();
            },
          });
        })
        .catch(() => {
          klienToken = null; // pakai mode tautan
        });

      tombol.addEventListener('click', (e) => {
        if (!klienToken || !kegiatan) return; // belum siap: biarkan tautan biasa bekerja
        e.preventDefault();
        if (sedangProses) return;
        sedangProses = true;
        klienToken.requestAccessToken();
      });
    }

    muatKegiatan();
  });
})();
