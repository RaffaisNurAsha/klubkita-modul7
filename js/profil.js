const statusEl = document.getElementById('status-halaman');
const isiEl = document.getElementById('isi-profil');
const formEl = document.getElementById('form-profil');
const namaLengkapEl = document.getElementById('nama-lengkap');
const namaPanggilanEl = document.getElementById('nama-panggilan');
const genderEl = document.getElementById('gender');
const alamatEl = document.getElementById('alamat');
const emailEl = document.getElementById('email');
const fotoEl = document.getElementById('foto');
const pratinjauEl = document.getElementById('foto-pratinjau');
const hapusFotoEl = document.getElementById('hapus-foto');
const pesanFormEl = document.getElementById('pesan-form');
const ringkasNamaEl = document.getElementById('ringkas-nama');
const ringkasEmailEl = document.getElementById('ringkas-email');
const statusRiwayatEl = document.getElementById('status-riwayat');
const daftarRiwayatEl = document.getElementById('daftar-riwayat');

const BATAS_FOTO = 1024 * 1024; // 1 MB, sama dengan batas bucket avatars
const JENIS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

let penggunaAktif = null;
let fotoSaatIni = ''; // alamat foto yang tersimpan sekarang
let fotoBaru = null;  // file yang baru dipilih, belum diunggah
let hapusFoto = false;
let alamatPratinjau = null;
let permintaanRiwayat = 0; // supaya hasil permintaan lama tidak menimpa yang baru

function kabari(pesan, tipe) {
  if (typeof tampilkanToast === 'function') {
    tampilkanToast(pesan, tipe);
  }
}

// pesan di samping tombol (misalnya "Coba lagi")
function isiStatus(el, pesan, aksi) {
  el.textContent = pesan;
  if (aksi) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.textContent = aksi.label;
    tombol.addEventListener('click', aksi.jalankan);
    el.append(' ', tombol);
  }
}

// nama dan email di samping foto mengikuti isi form
function perbaruiRingkasan() {
  ringkasNamaEl.textContent =
    namaLengkapEl.value.trim() || namaPanggilanEl.value.trim() || 'Pengguna KlubKita';
  ringkasEmailEl.textContent = emailEl.value;
}

namaLengkapEl.addEventListener('input', perbaruiRingkasan);
namaPanggilanEl.addEventListener('input', perbaruiRingkasan);

// ---------- foto profil ----------

function tampilkanPratinjau(sumber) {
  pratinjauEl.replaceChildren();
  if (sumber) {
    const img = document.createElement('img');
    img.src = sumber;
    img.alt = '';
    pratinjauEl.append(img);
  } else {
    const nama = namaPanggilanEl.value.trim() || namaLengkapEl.value.trim() || emailEl.value || '?';
    pratinjauEl.textContent = nama.charAt(0).toUpperCase();
  }
  hapusFotoEl.hidden = !sumber;
}

fotoEl.addEventListener('change', () => {
  const file = fotoEl.files[0];
  pesanFormEl.textContent = '';
  if (!file) return;

  if (!JENIS_FOTO.includes(file.type)) {
    pesanFormEl.textContent = 'Format foto harus JPG, PNG, atau WebP.';
    fotoEl.value = '';
    return;
  }
  if (file.size > BATAS_FOTO) {
    pesanFormEl.textContent = 'Ukuran foto terlalu besar. Maksimal 1 MB.';
    fotoEl.value = '';
    return;
  }

  fotoBaru = file;
  hapusFoto = false;
  if (alamatPratinjau) URL.revokeObjectURL(alamatPratinjau);
  alamatPratinjau = URL.createObjectURL(file);
  tampilkanPratinjau(alamatPratinjau);
});

hapusFotoEl.addEventListener('click', () => {
  fotoBaru = null;
  hapusFoto = true;
  fotoEl.value = '';
  tampilkanPratinjau('');
});

// ---------- kegiatan yang diikuti ----------

function buatBaris(r) {
  const k = r.kegiatan;
  const hadir = r.status_kehadiran === 'hadir';
  const li = document.createElement('li');

  const info = document.createElement('div');
  info.className = 'riwayat-info';
  const judul = document.createElement('strong');
  const link = document.createElement('a');
  link.href = `04-detail-event.html?id=${k.id}`;
  link.textContent = k.judul;
  judul.append(link);

  const waktu = document.createElement('p');
  waktu.textContent =
    `${formatTanggal(k.tanggal)}, ${formatJam(k.jam_mulai)} - ${formatJam(k.jam_selesai)} WIB`;
  info.append(judul, waktu);

  const aksi = document.createElement('div');
  aksi.className = 'riwayat-aksi';

  const lencana = document.createElement('span');
  lencana.className = `lencana-status ${hadir ? 'hadir' : 'tidak-hadir'}`;
  lencana.textContent = hadir ? 'Hadir' : 'Tidak hadir';
  aksi.append(lencana);

  if (hadir) {
    const tiket = document.createElement('a');
    tiket.className = 'tautan-tiket';
    tiket.href = `06-konfirmasi-rsvp.html?status_kehadiran=hadir&id=${k.id}&tiket=${r.id}`;
    tiket.textContent = 'Lihat tiket';
    aksi.append(tiket);
  }

  const batal = document.createElement('button');
  batal.type = 'button';
  batal.className = 'tombol-batal';
  batal.textContent = 'Batalkan RSVP';
  batal.addEventListener('click', () => batalkanRsvp(r, batal));
  aksi.append(batal);

  li.append(info, aksi);
  return li;
}

async function muatRiwayat() {
  const nomor = ++permintaanRiwayat;
  daftarRiwayatEl.replaceChildren();
  isiStatus(statusRiwayatEl, 'Memuat kegiatan...');

  // lebih dari 10 detik dianggap timeout
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), 10000);

  const { data, error } = await db
    .from('pendaftaran')
    .select('id, status_kehadiran, created_at, kegiatan:kegiatan_id(id, judul, tanggal, jam_mulai, jam_selesai)')
    .eq('user_id', penggunaAktif.id)
    .order('created_at', { ascending: false })
    .abortSignal(kontrol.signal);

  clearTimeout(timer);
  if (nomor !== permintaanRiwayat) return;

  if (error) {
    const pesan = kontrol.signal.aborted
      ? 'Koneksi terlalu lama. Coba lagi ya.'
      : 'Gagal memuat kegiatan. Periksa koneksi internet kamu.';
    isiStatus(statusRiwayatEl, pesan, { label: 'Coba lagi', jalankan: muatRiwayat });
    return;
  }

  const baris = data.filter((r) => r.kegiatan);
  if (baris.length === 0) {
    statusRiwayatEl.textContent = '';
    const kosong = document.createElement('li');
    kosong.append('Kamu belum mengikuti kegiatan apa pun. ');
    const lihat = document.createElement('a');
    lihat.href = '02-kalender-event.html';
    lihat.textContent = 'Lihat kalender kegiatan';
    kosong.append(lihat);
    daftarRiwayatEl.append(kosong);
    return;
  }

  statusRiwayatEl.textContent = '';
  baris.forEach((r) => daftarRiwayatEl.append(buatBaris(r)));
}

async function batalkanRsvp(r, tombol) {
  const pesan =
    `Kamu tidak akan terdaftar lagi di ${r.kegiatan.judul}. ` +
    'Kamu bisa mendaftar ulang selama kuotanya masih tersedia.';
  const lanjut =
    typeof konfirmasiDialog === 'function'
      ? await konfirmasiDialog({
        judul: 'Batalkan RSVP?',
        pesan,
        labelYa: 'Ya, batalkan',
        labelTidak: 'Tidak jadi',
        bahaya: true,
      })
      : window.confirm(`Batalkan RSVP untuk ${r.kegiatan.judul}?`);
  if (!lanjut) return;

  tombol.disabled = true;
  const { data, error } = await db.from('pendaftaran').delete().eq('id', r.id).select();

  if (error || !data || data.length === 0) {
    tombol.disabled = false;
    kabari('Gagal membatalkan RSVP. Coba lagi ya.', 'error');
    return;
  }

  kabari('RSVP berhasil dibatalkan.', 'success');
  muatRiwayat();
}

// ---------- simpan profil ----------

function periksaForm() {
  const namaLengkap = namaLengkapEl.value.trim();
  const namaPanggilan = namaPanggilanEl.value.trim();
  const alamat = alamatEl.value.trim();

  if (namaLengkap.length < 2) return { galat: 'Nama lengkap minimal 2 karakter.', el: namaLengkapEl };
  if (namaLengkap.length > 60) return { galat: 'Nama lengkap maksimal 60 karakter.', el: namaLengkapEl };
  if (namaPanggilan.length > 30) return { galat: 'Nama panggilan maksimal 30 karakter.', el: namaPanggilanEl };
  if (alamat.length > 200) return { galat: 'Alamat maksimal 200 karakter.', el: alamatEl };

  return { nilai: { namaLengkap, namaPanggilan, gender: genderEl.value, alamat } };
}

async function unggahFoto() {
  const jalur = `${penggunaAktif.id}/avatar`;
  const { error } = await db.storage
    .from('avatars')
    .upload(jalur, fotoBaru, { upsert: true, contentType: fotoBaru.type, cacheControl: '3600' });
  if (error) throw error;

  const { data } = db.storage.from('avatars').getPublicUrl(jalur);
  // tambahan ?v= supaya browser tidak memakai foto lama dari cache
  return `${data.publicUrl}?v=${Date.now()}`;
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  pesanFormEl.textContent = '';
  [namaLengkapEl, namaPanggilanEl, alamatEl].forEach((el) => el.removeAttribute('aria-invalid'));

  const hasil = periksaForm();
  if (hasil.galat) {
    pesanFormEl.textContent = hasil.galat;
    hasil.el.setAttribute('aria-invalid', 'true');
    hasil.el.focus();
    return;
  }

  const tombol = formEl.querySelector('button[type="submit"]');
  tombol.disabled = true;
  tombol.textContent = 'Menyimpan...';

  try {
    let alamatFoto = fotoSaatIni;

    if (hapusFoto) {
      // hapus file lama, kalau gagal tetap lanjut karena yang penting foto tidak tampil lagi
      await db.storage.from('avatars').remove([`${penggunaAktif.id}/avatar`]);
      alamatFoto = '';
    }
    if (fotoBaru) {
      try {
        alamatFoto = await unggahFoto();
      } catch (err) {
        pesanFormEl.textContent = 'Gagal mengunggah foto. Coba lagi ya.';
        return;
      }
    }

    const { error } = await db.auth.updateUser({
      data: {
        nama_lengkap: hasil.nilai.namaLengkap,
        nama_panggilan: hasil.nilai.namaPanggilan,
        gender: hasil.nilai.gender,
        alamat: hasil.nilai.alamat,
        avatar_url: alamatFoto,
      },
    });

    if (error) {
      pesanFormEl.textContent = 'Gagal menyimpan perubahan. Periksa koneksi internet kamu.';
      return;
    }

    fotoSaatIni = alamatFoto;
    fotoBaru = null;
    hapusFoto = false;
    fotoEl.value = '';
    tampilkanPratinjau(alamatFoto);
    perbaruiRingkasan();
    kabari('Profil berhasil diperbarui.', 'success');
  } finally {
    tombol.disabled = false;
    tombol.textContent = 'Simpan perubahan';
  }
});

// ---------- mulai ----------

async function mulai() {
  statusEl.textContent = 'Memuat profil...';

  const { data, error } = await db.auth.getSession();
  if (error) {
    isiStatus(statusEl, 'Gagal memuat profil. Periksa koneksi internet kamu.', {
      label: 'Coba lagi',
      jalankan: mulai,
    });
    return;
  }

  if (!data.session) {
    statusEl.textContent = 'Kamu belum masuk. ';
    const masuk = document.createElement('a');
    masuk.href = '12-login.html';
    masuk.textContent = 'Masuk untuk melihat profil';
    statusEl.append(masuk);
    return;
  }

  penggunaAktif = data.session.user;
  const meta = penggunaAktif.user_metadata || {};
  namaLengkapEl.value = meta.nama_lengkap || '';
  namaPanggilanEl.value = meta.nama_panggilan || '';
  genderEl.value = meta.gender || '';
  alamatEl.value = meta.alamat || '';
  emailEl.value = penggunaAktif.email || '';
  fotoSaatIni = meta.avatar_url || '';
  tampilkanPratinjau(fotoSaatIni);
  perbaruiRingkasan();

  statusEl.textContent = '';
  isiEl.hidden = false;
  muatRiwayat();
}

window.addEventListener('DOMContentLoaded', mulai);
