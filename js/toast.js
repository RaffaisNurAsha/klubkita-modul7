
/**
 * KlubKita - Toast Notification
 * Anggota 2: Tampilan & UX State
 */

function tampilkanToast(pesan, tipe = "info") {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Notifikasi");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipe}`;

  const teks = document.createElement("span");
  teks.textContent = pesan;

  const tombolTutup = document.createElement("button");
  tombolTutup.type = "button";
  tombolTutup.className = "toast-close";
  tombolTutup.textContent = "×";
  tombolTutup.setAttribute("aria-label", "Tutup notifikasi");

  tombolTutup.addEventListener("click", () => toast.remove());

  toast.append(teks, tombolTutup);
  container.appendChild(toast);

  window.setTimeout(() => toast.remove(), 4000);
}
