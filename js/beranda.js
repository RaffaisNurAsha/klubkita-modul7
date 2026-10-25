// nama: Raffais Nur Asha
// NIM: 3420240013

const daftarEl = document.getElementById('daftar-kegiatan');
const statusEl = document.getElementById('status-kegiatan');

function hariIni() {
  const t = new Date();
  const bulan = String(t.getMonth() + 1).padStart(2, '0');
  const tgl = String(t.getDate()).padStart(2, '0');
  return `${t.getFullYear()}-${bulan}-${tgl}`;
}

function tampilkanStatus(pesan, bisaCobaLagi = false) {
  statusEl.textContent = pesan;
  if (bisaCobaLagi) {
    const tombol = document.createElement('button');
    tombol.type = 'button';
    tombol.textContent = 'Coba lagi';
    tombol.addEventListener('click', muatKegiatan);
    statusEl.append(' ', tombol);
  }
}

function buatCard(k) {
  const card = document.createElement('article');

  const img = document.createElement('img');
  img.src = k.gambar_url;
  img.alt = `Kegiatan ${k.judul}`;

  const judul = document.createElement('h3');
  judul.textContent = k.judul;

  const tanggal = document.createElement('p');
  tanggal.textContent = formatTanggal(k.tanggal);

  const jam = document.createElement('p');
  jam.textContent = `${formatJam(k.jam_mulai)} - ${formatJam(k.jam_selesai)} WIB`;

  const p = document.createElement('p');
  const link = document.createElement('a');
  link.href = `04-detail-event.html?id=${k.id}`;
  link.textContent = 'Lihat Detail';
  p.append(link);

  card.append(img, judul, tanggal, jam, p);
  return card;
}

async function muatKegiatan() {
  // Tampilkan skeleton (3 kartu cukup di layar kecil)
  var jumlahSkeleton = window.innerWidth <= 600 ? 3 : 6;
  tampilkanSkeleton(daftarEl, jumlahSkeleton, 'grid');
  statusEl.textContent = '';

  // kalau lebih dari 10 detik dianggap timeout
  const kontrol = new AbortController();
  const timer = setTimeout(() => kontrol.abort(), 10000);

  const { data, error } = await db
    .from('kegiatan')
    .select('*')
    .gte('tanggal', hariIni())
    .order('tanggal')
    .order('jam_mulai')
    .limit(6)
    .abortSignal(kontrol.signal);

  clearTimeout(timer);

  // Bersihkan skeleton
  hapusSkeleton(daftarEl);
  daftarEl.replaceChildren();

  if (error) {
    const pesan = kontrol.signal.aborted
      ? 'Koneksi terlalu lama. Coba lagi ya.'
      : 'Gagal memuat kegiatan. Periksa koneksi internet kamu.';
    tampilkanStatus(pesan, true);
    return;
  }

  if (data.length === 0) {
    tampilkanStatus('Belum ada kegiatan terdekat.');
    return;
  }

  statusEl.textContent = '';
  data.forEach((k) => daftarEl.append(buatCard(k)));
}

muatKegiatan();

