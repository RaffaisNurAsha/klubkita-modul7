// nama: Raffais Nur Asha
// NIM: 3420240013

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// "2026-10-24" -> "Sabtu, 24 Oktober 2026"
function formatTanggal(str) {
  const [th, bl, tg] = str.split('-').map(Number);
  const hari = NAMA_HARI[new Date(th, bl - 1, tg).getDay()];
  return `${hari}, ${tg} ${NAMA_BULAN[bl - 1]} ${th}`;
}

// "16:00:00" -> "16.00"
function formatJam(str) {
  return str.slice(0, 5).replace(':', '.');
}
