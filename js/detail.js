// nama: Raffais Nur Asha
// NIM: 3420240013

const kontenEl = document.getElementById('konten-event');
const statusEl = document.getElementById('status-halaman');

function el(id) {
  return document.getElementById(id);
}

function tampilkanStatus(pesan, bisaCobaLagi = false) {
  statusEl.textContent = pesan;
  if (bisaCobaLagi) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.textContent = 'Coba lagi';
    tombol.addEventListener('click', muatEvent);
    statusEl.append(' ', tombol);
  }
}

function isiHalaman(k, terdaftar) {
  const judul = k.judul_detail || k.judul;
  const kuota = k.kuota ?? 0;
  const sisa = Math.max(kuota - terdaftar, 0);
  const masihAda = sisa > 0;

  document.title = `KlubKita - ${judul}`;

  el('gambar-event').src = k.gambar_url;
  el('gambar-event').alt = `Kegiatan ${k.judul}`;
  el('kategori-event').textContent = k.kategori || '';
  el('judul-event').textContent = judul;
  el('ringkasan-event').textContent = k.deskripsi || '';

  // baris info: tanggal + waktu, lokasi + alamat, kuota
  el('info-tanggal').textContent = formatTanggal(k.tanggal);
  el('info-waktu').textContent = `${formatJam(k.jam_mulai)} - ${formatJam(k.jam_selesai)} WIB`;
  el('info-lokasi').textContent = k.lokasi || '-';
  el('info-alamat').textContent = k.alamat || '';
  el('info-alamat').hidden = !k.alamat;
  el('info-kuota').textContent = `${terdaftar}/${kuota} Peserta`;

  // status event (kartu kanan atas)
  el('status-teks').textContent = masihAda ? 'Tersedia' : 'Penuh';
  el('status-teks').dataset.status = masihAda ? 'tersedia' : 'penuh';
  el('sisa-kuota').textContent = `Tersisa ${sisa} dari ${kuota} peserta`;
  el('tombol-rsvp').href = `05-form-rsvp.html?id=${k.id}`;
  el('bagian-rsvp').hidden = !masihAda;

  // status pendaftaran (kartu kanan bawah)
  el('pendaftaran-status').textContent = masihAda ? 'Masih tersedia' : 'Kuota penuh';
  el('pendaftaran-sisa').textContent = masihAda
    ? `Tersisa ${sisa} dari ${kuota} orang peserta`
    : `Semua ${kuota} kursi sudah terisi`;

  el('deskripsi-lengkap').textContent = k.deskripsi_lengkap || k.deskripsi || '';

  // daftar yang perlu dibawa, disembunyikan kalau kosong
  const daftarBawa = k.yang_dibawa || [];
  el('daftar-bawa').replaceChildren();
  daftarBawa.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    el('daftar-bawa').append(li);
  });
  el('judul-bawa').hidden = daftarBawa.length === 0;
  el('daftar-bawa').hidden = daftarBawa.length === 0;

  // peta dan maps, disembunyikan kalau belum ada datanya
  el('gambar-peta').hidden = !k.peta_url;
  if (k.peta_url) {
    el('gambar-peta').src = k.peta_url;
    el('gambar-peta').alt = `Peta lokasi ${k.lokasi}`;
  }
  el('lokasi-nama').textContent = k.lokasi || '';
  el('lokasi-alamat').textContent = k.alamat || '';
  el('bagian-maps').hidden = !k.maps_url;
  if (k.maps_url) {
    el('link-maps').href = k.maps_url;
  }

  el('info-penyelenggara').textContent = k.penyelenggara || '-';
  el('info-kontak').textContent = k.kontak || '-';

  statusEl.textContent = '';
  kontenEl.hidden = false;
}

async function muatEvent() {
  // id kegiatan diambil dari URL, contoh: 04-detail-event.html?id=1
  const id = Number(new URLSearchParams(location.search).get('id'));
  if (!id) {
    tampilkanStatus('Kegiatan tidak ditemukan.');
    return;
  }

  kontenEl.hidden = true;
  tampilkanStatus('Memuat detail kegiatan...');

  // lebih dari 10 detik dianggap timeout
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), 10000);

  const [kegiatan, pendaftaran] = await Promise.all([
    db.from('kegiatan').select('*').eq('id', id).maybeSingle().abortSignal(kontrol.signal),
    db.from('pendaftaran')
      .select('*', { count: 'exact', head: true })
      .eq('kegiatan_id', id)
      .abortSignal(kontrol.signal),
  ]);

  clearTimeout(timer);

  if (kegiatan.error || pendaftaran.error) {
    const pesan = kontrol.signal.aborted
      ? 'Koneksi terlalu lama. Coba lagi ya.'
      : 'Gagal memuat detail kegiatan. Periksa koneksi internet kamu.';
    tampilkanStatus(pesan, true);
    return;
  }

  if (!kegiatan.data) {
    tampilkanStatus('Kegiatan tidak ditemukan.');
    return;
  }

  isiHalaman(kegiatan.data, pendaftaran.count ?? 0);
}

muatEvent();
