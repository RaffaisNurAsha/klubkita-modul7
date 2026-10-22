
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
