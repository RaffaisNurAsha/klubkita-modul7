
/**
 * KlubKita - Toast Notification
 * Anggota 2: Tampilan & UX State
 */

function tampilkanToast(pesan, tipe = "info", durasi = 4000) {
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

  // ikon bulat di kiri; simbolnya digambar lewat CSS menurut tipe toast
  const ikon = document.createElement("span");
  ikon.className = "toast-ikon";
  ikon.setAttribute("aria-hidden", "true");

  const teks = document.createElement("span");
  teks.className = "toast-teks";
  teks.textContent = pesan;

  const tombolTutup = document.createElement("button");
  tombolTutup.type = "button";
  tombolTutup.className = "toast-close";
  tombolTutup.textContent = "×";
  tombolTutup.setAttribute("aria-label", "Tutup notifikasi");

  tombolTutup.addEventListener("click", () => toast.remove());

  toast.append(ikon, teks, tombolTutup);
  container.appendChild(toast);

  window.setTimeout(() => toast.remove(), durasi);
}
