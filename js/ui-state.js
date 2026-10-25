
/**
 * KlubKita - UI State
 * Anggota 2: Tampilan & UX
 */

/**
 * Menampilkan indikator loading.
 */
function tampilkanLoading(container, pesan = "Memuat data...") {
  container.replaceChildren();

  const loading = document.createElement("p");
  loading.className = "ui-state ui-loading";
  loading.setAttribute("role", "status");
  loading.textContent = pesan;

  container.appendChild(loading);
}

/**
 * Menampilkan pesan saat data kosong.
 */
function tampilkanEmpty(container, pesan = "Belum ada data.") {
  container.replaceChildren();

  const empty = document.createElement("div");
  empty.className = "ui-state ui-empty";

  const teks = document.createElement("p");
  teks.textContent = pesan;

  empty.appendChild(teks);
  container.appendChild(empty);
}

/**
 * Menampilkan pesan error dan tombol coba lagi.
 */
function tampilkanError(
  container,
  pesan = "Data gagal dimuat.",
  fungsiRetry = null
) {
  container.replaceChildren();

  const errorBox = document.createElement("div");
  errorBox.className = "ui-state ui-error";
  errorBox.setAttribute("role", "alert");

  const teks = document.createElement("p");
  teks.textContent = pesan;
  errorBox.appendChild(teks);

  if (typeof fungsiRetry === "function") {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "ui-retry-button";
    tombol.textContent = "Coba Lagi";

    tombol.addEventListener("click", fungsiRetry);
    errorBox.appendChild(tombol);
  }

  container.appendChild(errorBox);
}

/**
 * Membuat satu kartu skeleton placeholder.
 */
function buatSkeletonCard() {
  var card = document.createElement("div");
  card.className = "skeleton-card";

  var img = document.createElement("div");
  img.className = "skeleton-img";

  var title = document.createElement("div");
  title.className = "skeleton-line skeleton-line--title";

  var date = document.createElement("div");
  date.className = "skeleton-line skeleton-line--date";

  var time = document.createElement("div");
  time.className = "skeleton-line skeleton-line--time";

  var link = document.createElement("div");
  link.className = "skeleton-line skeleton-line--link";

  card.append(img, title, date, time, link);
  return card;
}

/**
 * Menampilkan kartu skeleton berdenyut (shimmer) sebagai placeholder loading.
 *
 * @param {HTMLElement} container  - Elemen yang akan diisi skeleton.
 * @param {number}      jumlah    - Jumlah kartu skeleton (default 6).
 * @param {string}      varian    - 'grid' (beranda, default) atau 'horizontal' (kalender 02/03).
 */
function tampilkanSkeleton(container, jumlah, varian) {
  if (jumlah === undefined || jumlah === null) jumlah = 6;
  if (!varian) varian = "grid";

  container.replaceChildren();
  container.setAttribute("aria-busy", "true");

  // Teks tersembunyi untuk screen reader
  var srText = document.createElement("p");
  srText.className = "visually-hidden";
  srText.setAttribute("role", "status");
  srText.textContent = "Memuat kegiatan...";
  container.appendChild(srText);

  var wrapper = document.createElement("div");
  wrapper.className = varian === "horizontal"
    ? "skeleton skeleton--horizontal"
    : "skeleton";

  for (var i = 0; i < jumlah; i++) {
    wrapper.appendChild(buatSkeletonCard());
  }

  container.appendChild(wrapper);
}

/**
 * Menghapus skeleton dan mengatur ulang aria-busy pada container.
 */
function hapusSkeleton(container) {
  if (!container) return;
  container.removeAttribute("aria-busy");

  var skeletonEl = container.querySelector(".skeleton");
  if (skeletonEl) skeletonEl.remove();

  var srText = container.querySelector(".visually-hidden");
  if (srText) srText.remove();
}
