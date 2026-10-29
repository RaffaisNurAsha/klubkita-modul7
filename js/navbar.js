// nama: Raffais Nur Asha
// NIM: 3420240013

// Menu akun (Profil Saya dan Keluar) dan lonceng notifikasi di navigasi atas.
// Lonceng membuka halaman notifikasi (07-reminder-notifikasi.html).
// Daftar notifikasi dihitung dari tabel pendaftaran dan diperbarui langsung lewat Supabase Realtime.
(function () {
  const HARI_MS = 24 * 60 * 60 * 1000;
  const KUNCI_DIBACA = 'klubkita-notif-dibaca-';
  const HALAMAN_NOTIF = '07-reminder-notifikasi.html';
  const HALAMAN_PROFIL = '14-profil.html';
  const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const IKON_LONCENG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';

  const IKON_HAMBURGER =
    '<svg class="hamburger-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>' +
    '<svg class="tutup-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  let nav = null;
  let pengguna = null;
  let notifikasi = [];
  let dibaca = new Set();
  let statusNotif = 'memuat'; // memuat | siap | gagal | belum-masuk
  let wadah = null;
  let tombolLonceng = null;
  let tombolAvatar = null;
  let tombolHamburger = null;
  let navMenu = null;
  let lencana = null;
  let panelAkun = null;
  let canal = null;
  let pewaktu = null;
  let tundaMuat = null;

  // ---------- helper kecil ----------

  function tanggalLokal(str) {
    const [th, bl, tg] = str.split('-').map(Number);
    return new Date(th, bl - 1, tg);
  }

  function jamPendek(str) {
    return str.slice(0, 5).replace(':', '.');
  }

  function buat(tag, teks, atribut) {
    const el = document.createElement(tag);
    if (teks) el.textContent = teks;
    if (atribut) Object.keys(atribut).forEach((k) => el.setAttribute(k, atribut[k]));
    return el;
  }

  function bacaDibaca(idPengguna) {
    try {
      return new Set(JSON.parse(localStorage.getItem(KUNCI_DIBACA + idPengguna) || '[]'));
    } catch (err) {
      return new Set();
    }
  }

  function simpanDibaca() {
    if (!pengguna) return;
    try {
      localStorage.setItem(KUNCI_DIBACA + pengguna.id, JSON.stringify([...dibaca]));
    } catch (err) {
      // kalau penyimpanan tidak bisa dipakai, status baca hilang saat halaman dimuat ulang
    }
  }

  // ---------- memuat CSS dan Supabase kalau halaman belum punya ----------

  function muatSkrip(src) {
    return new Promise((ok, gagal) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = gagal;
      document.head.append(s);
    });
  }

  async function siapkanDb() {
    if (typeof db !== 'undefined') return true;
    try {
      if (typeof supabase === 'undefined') {
        await muatSkrip('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      }
      await muatSkrip('js/supabase-client.js');
      return typeof db !== 'undefined';
    } catch (err) {
      return false;
    }
  }

  function muatCss() {
    return new Promise((selesai) => {
      const sudahAda = document.querySelector('link[href$="akun.css"]');
      if (sudahAda) return selesai();
      const link = buat('link', null, { rel: 'stylesheet', href: 'css/akun.css' });
      link.onload = selesai;
      link.onerror = selesai;
      document.head.append(link);
      setTimeout(selesai, 800); // jangan menunggu terlalu lama
    });
  }

  // ---------- menyusun notifikasi dari data pendaftaran ----------

  function susunNotifikasi(baris, sekarang) {
    const awalHariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
    const hasil = [];

    baris.forEach((r) => {
      const k = r.kegiatan;
      if (!k) return;

      const nama = k.judul_detail || k.judul;
      const tgl = tanggalLokal(k.tanggal);
      const [jj, mm] = k.jam_mulai.split(':').map(Number);
      const mulai = new Date(tgl.getFullYear(), tgl.getMonth(), tgl.getDate(), jj, mm);
      const jam = jamPendek(k.jam_mulai);
      const hari = NAMA_HARI[tgl.getDay()];
      const dibuat = new Date(r.created_at);
      const hadir = r.status_kehadiran === 'hadir';

      // konfirmasi setelah RSVP berhasil (tampil 7 hari)
      if (sekarang - dibuat < 7 * HARI_MS) {
        hasil.push({
          id: `rsvp-${r.id}`,
          waktu: dibuat,
          label: 'Konfirmasi',
          rsvpId: r.id,
          kegiatanId: k.id,
          status: r.status_kehadiran,
          judul: 'KlubKita - Konfirmasi',
          pesan: hadir
            ? `RSVP kamu untuk ${nama} sudah tersimpan. Sampai jumpa hari ${hari}, pukul ${jam}.`
            : `Ketidakhadiranmu pada ${nama} sudah kami catat.`,
        });
      }

      // pengingat hanya untuk kegiatan yang akan dihadiri
      if (!hadir) return;

      const sisaMenit = Math.round((mulai - sekarang) / 60000);
      if (sisaMenit <= 0) return; // kegiatan sudah mulai

      // sehari (24 jam) sebelum kegiatan
      const saatH1 = new Date(mulai - HARI_MS);
      if (sekarang >= saatH1) {
        const kapan = Math.round((tgl - awalHariIni) / HARI_MS) === 1 ? 'besok' : 'hari ini';
        const tempat = k.lokasi ? ` di ${k.lokasi}` : '';
        hasil.push({
          id: `h1-${r.id}-${k.tanggal}`,
          waktu: saatH1 > dibuat ? saatH1 : dibuat,
          label: 'H-1',
          rsvpId: r.id,
          kegiatanId: k.id,
          status: r.status_kehadiran,
          judul: 'KlubKita - Reminder (H-1)',
          pesan: `${nama} dimulai ${kapan}, ${hari} ${jam}${tempat}.`,
        });
      }

      // satu jam sebelum kegiatan
      if (sisaMenit <= 60) {
        const sisa = sisaMenit >= 55 ? '1 jam' : `${sisaMenit} menit`;
        hasil.push({
          id: `sejam-${r.id}-${k.tanggal}`,
          waktu: new Date(mulai - 60 * 60000),
          label: 'H-0 1 jam sebelum',
          rsvpId: r.id,
          kegiatanId: k.id,
          status: r.status_kehadiran,
          judul: 'KlubKita - Reminder (H-0)',
          pesan: `${nama} dimulai ${sisa} lagi, pukul ${jam}. Sampai jumpa di lapangan!`,
        });
      }
    });

    return hasil.sort((a, b) => b.waktu - a.waktu).slice(0, 30);
  }

  async function ambilNotifikasi() {
    const { data, error } = await db
      .from('pendaftaran')
      .select(
        'id, status_kehadiran, created_at, ' +
        'kegiatan:kegiatan_id(id, judul, judul_detail, tanggal, jam_mulai, lokasi)'
      )
      .eq('user_id', pengguna.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return susunNotifikasi(data || [], new Date());
  }

  // ---------- data notifikasi yang dipakai halaman lain ----------

  function beritahu() {
    window.dispatchEvent(new CustomEvent('klubkita:notifikasi'));
  }

  window.KlubKitaNotif = {
    ambil() {
      return { status: statusNotif, daftar: notifikasi.slice(), dibaca: new Set(dibaca) };
    },
    tandaiSemuaDibaca() {
      notifikasi.forEach((n) => dibaca.add(n.id));
      simpanDibaca();
      perbaruiLencana();
      beritahu();
    },
    muatUlang() {
      return muatNotifikasi();
    },
  };

  function perbaruiLencana() {
    if (!lencana) return;
    const belumDibaca = notifikasi.filter((n) => !dibaca.has(n.id)).length;
    lencana.hidden = belumDibaca === 0;
    lencana.textContent = belumDibaca > 9 ? '9+' : String(belumDibaca);
    tombolLonceng.setAttribute(
      'aria-label',
      belumDibaca > 0 ? `Notifikasi, ${belumDibaca} belum dibaca` : 'Notifikasi'
    );
  }

  async function muatNotifikasi() {
    if (!pengguna) return;
    const idSaatIni = pengguna.id;
    try {
      const hasil = await ambilNotifikasi();
      if (!pengguna || pengguna.id !== idSaatIni) return;
      notifikasi = hasil;
      statusNotif = 'siap';
    } catch (err) {
      if (!pengguna || pengguna.id !== idSaatIni) return;
      statusNotif = 'gagal';
    }
    perbaruiLencana();
    beritahu();
  }

  // ---------- realtime ----------

  function jadwalkanMuatUlang() {
    clearTimeout(tundaMuat);
    tundaMuat = setTimeout(muatNotifikasi, 300);
  }

  function mulaiLangganan(idPengguna) {
    try {
      const saring = {
        schema: 'public',
        table: 'pendaftaran',
        filter: `user_id=eq.${idPengguna}`,
      };
      canal = db
        .channel(`notif-${idPengguna}`)
        .on('postgres_changes', { event: 'INSERT', ...saring }, jadwalkanMuatUlang)
        .on('postgres_changes', { event: 'UPDATE', ...saring }, jadwalkanMuatUlang)
        // data yang dihapus tidak membawa user_id, jadi tidak bisa disaring
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pendaftaran' }, jadwalkanMuatUlang)
        .subscribe();
    } catch (err) {
      canal = null;
    }
    // cadangan: tetap segarkan tiap menit (pengingat berdasarkan jam tetap akurat)
    pewaktu = setInterval(muatNotifikasi, 60000);
  }

  function hentikanLangganan() {
    clearInterval(pewaktu);
    clearTimeout(tundaMuat);
    pewaktu = null;
    if (canal) {
      try {
        db.removeChannel(canal);
      } catch (err) {
        // abaikan
      }
      canal = null;
    }
  }

  // ---------- navigasi mobile & menu akun ----------

  function tutupPanel() {
    if (!panelAkun) return;
    panelAkun.hidden = true;
    tombolAvatar.setAttribute('aria-expanded', 'false');
  }

  function tutupNavMenu() {
    if (!nav || !nav.classList.contains('nav-buka')) return false;
    nav.classList.remove('nav-buka');
    if (tombolHamburger) {
      tombolHamburger.setAttribute('aria-expanded', 'false');
      tombolHamburger.setAttribute('aria-label', 'Buka menu navigasi');
    }
    return true;
  }

  function toggleNavMenu() {
    if (!nav) return;
    if (nav.classList.contains('nav-buka')) {
      tutupNavMenu();
    } else {
      tutupPanel(); // tutup menu profil jika sedang terbuka
      nav.classList.add('nav-buka');
      if (tombolHamburger) {
        tombolHamburger.setAttribute('aria-expanded', 'true');
        tombolHamburger.setAttribute('aria-label', 'Tutup menu navigasi');
      }
    }
  }

  function bukaAkun() {
    const sedangBuka = !panelAkun.hidden;
    tutupPanel();
    tutupNavMenu(); // tutup menu navigasi jika sedang terbuka
    if (sedangBuka) return;
    panelAkun.hidden = false;
    tombolAvatar.setAttribute('aria-expanded', 'true');
  }

  function siapkanNav() {
    if (!nav) return;

    // 1. Bungkus tautan navigasi (Beranda, Kalender, Tentang) ke dalam .nav-menu jika belum ada
    navMenu = nav.querySelector('#nav-menu');
    if (!navMenu) {
      navMenu = buat('div', null, { id: 'nav-menu', class: 'nav-menu' });
      // Ambil tautan navigasi selain logo (pertama) dan selain tombol login
      const semuaTautan = Array.from(nav.querySelectorAll('a'));
      const logo = semuaTautan[0];
      const tautanMenu = semuaTautan.slice(1).filter((a) => a.id !== 'tautan-masuk');

      tautanMenu.forEach((a) => {
        navMenu.append(a);
        a.addEventListener('click', tutupNavMenu);
      });

      if (logo && logo.nextSibling) {
        nav.insertBefore(navMenu, logo.nextSibling);
      } else {
        nav.append(navMenu);
      }
    }

    // 2. Buat tombol hamburger jika belum ada
    if (!tombolHamburger) {
      tombolHamburger = buat('button', null, {
        type: 'button',
        id: 'nav-hamburger',
        class: 'nav-hamburger',
        'aria-label': 'Buka menu navigasi',
        'aria-expanded': 'false',
        'aria-controls': 'nav-menu',
      });
      tombolHamburger.innerHTML = IKON_HAMBURGER;
      tombolHamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNavMenu();
      });
      nav.append(tombolHamburger);
    }
  }

  async function keluar() {
    const { error } = await db.auth.signOut();
    if (error) {
      if (typeof tampilkanToast === 'function') {
        tampilkanToast('Gagal keluar. Coba lagi ya.', 'error');
      }
      return;
    }
    window.location.href = '01-beranda.html';
  }

  function dataNama(user) {
    const meta = user.user_metadata || {};
    const awalEmail = user.email ? user.email.split('@')[0] : 'Pengguna';
    return {
      lengkap: meta.nama_lengkap || meta.nama_panggilan || awalEmail,
      inisial: (meta.nama_panggilan || meta.nama_lengkap || awalEmail).charAt(0).toUpperCase(),
      foto: meta.avatar_url || '',
    };
  }

  function bangunMenu() {
    const nama = dataNama(pengguna);
    wadah = buat('div', null, { id: 'menu-akun' });

    // lonceng + lencana: membuka halaman notifikasi
    tombolLonceng = buat('button', null, { type: 'button', class: 'akun-ikon', 'aria-label': 'Notifikasi' });
    tombolLonceng.innerHTML = IKON_LONCENG;
    lencana = buat('span', '0', { class: 'akun-lencana' });
    lencana.hidden = true;
    tombolLonceng.append(lencana);
    tombolLonceng.addEventListener('click', () => {
      window.location.href = HALAMAN_NOTIF;
    });

    // avatar (foto atau huruf pertama) + menu akun
    tombolAvatar = buat('button', null, {
      type: 'button',
      class: 'akun-avatar',
      'aria-label': `Menu akun ${nama.lengkap}`,
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    });
    if (nama.foto) {
      tombolAvatar.append(buat('img', null, { src: nama.foto, alt: '' }));
    } else {
      tombolAvatar.textContent = nama.inisial;
    }
    tombolAvatar.addEventListener('click', bukaAkun);

    panelAkun = buat('div', null, { class: 'akun-panel akun-menu', role: 'menu' });
    panelAkun.hidden = true;
    const identitas = buat('div', null, { class: 'akun-identitas' });
    identitas.append(buat('strong', nama.lengkap), buat('span', pengguna.email || ''));

    const profil = buat('button', 'Profil Saya', { type: 'button', role: 'menuitem' });
    profil.addEventListener('click', () => {
      window.location.href = HALAMAN_PROFIL;
    });
    const logout = buat('button', 'Keluar', { type: 'button', role: 'menuitem' });
    logout.addEventListener('click', keluar);
    panelAkun.append(identitas, profil, logout);

    wadah.append(tombolLonceng, tombolAvatar, panelAkun);
    if (tombolHamburger && tombolHamburger.parentNode === nav) {
      nav.insertBefore(wadah, tombolHamburger);
    } else {
      nav.append(wadah);
    }
  }

  function tampilkan(user) {
    hentikanLangganan();

    const lama = document.getElementById('menu-akun');
    if (lama) lama.remove();
    const tautanMasuk = document.getElementById('tautan-masuk');
    if (tautanMasuk) tautanMasuk.remove();
    wadah = tombolLonceng = tombolAvatar = lencana = panelAkun = null;

    pengguna = user;
    notifikasi = [];

    if (!user) {
      statusNotif = 'belum-masuk';
      // di halaman login sendiri tidak perlu tombol Masuk
      if (!/12-login/.test(window.location.pathname)) {
        const tautanMasukEl = buat('a', 'Masuk', { id: 'tautan-masuk', href: '12-login.html' });
        if (tombolHamburger && tombolHamburger.parentNode === nav) {
          nav.insertBefore(tautanMasukEl, tombolHamburger);
        } else {
          nav.append(tautanMasukEl);
        }
      }
      beritahu();
      return;
    }

    statusNotif = 'memuat';
    dibaca = bacaDibaca(user.id);
    bangunMenu();
    beritahu();
    muatNotifikasi();
    mulaiLangganan(user.id);
  }

  async function mulai() {
    nav = document.querySelector('body > header nav');
    if (!nav) return;

    siapkanNav();

    await muatCss();
    if (!(await siapkanDb())) {
      statusNotif = 'gagal';
      beritahu();
      return;
    }

    const { data } = await db.auth.getSession();
    tampilkan(data.session ? data.session.user : null);

    db.auth.onAuthStateChange((event, session) => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) return;
      const user = session ? session.user : null;
      // login ulang oleh akun yang sama tidak perlu menggambar ulang
      if (event === 'SIGNED_IN' && user && pengguna && pengguna.id === user.id) return;
      setTimeout(() => tampilkan(user), 0);
    });

    // klik di luar menu atau tekan Esc menutup dropdown akun dan menu navigasi
    document.addEventListener('click', (e) => {
      if (wadah && !wadah.contains(e.target)) tutupPanel();
      if (navMenu && !navMenu.contains(e.target) && (!tombolHamburger || !tombolHamburger.contains(e.target))) {
        tutupNavMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (tutupNavMenu() && tombolHamburger) {
          tombolHamburger.focus();
        }
        if (panelAkun && !panelAkun.hidden) {
          tutupPanel();
          if (tombolAvatar) tombolAvatar.focus();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        tutupNavMenu();
      }
    });
  }

  if (document.readyState === 'complete') {
    mulai();
  } else {
    document.addEventListener('DOMContentLoaded', mulai);
  }
})();
