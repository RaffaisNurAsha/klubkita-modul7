
(function () {
  const IKON_PERINGATAN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>' +
    '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

  const IKON_INFO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';

  function buat(tag, kelas, teks) {
    const el = document.createElement(tag);
    if (kelas) el.className = kelas;
    if (teks) el.textContent = teks;
    return el;
  }

  window.konfirmasiDialog = function (opsi) {
    const o = Object.assign(
      {
        judul: 'Yakin?',
        pesan: '',
        labelYa: 'Ya',
        labelTidak: 'Batal',
        bahaya: false,
      },
      opsi || {}
    );

    // kalau browser terlalu lama dan belum mengenal <dialog>, pakai confirm biasa
    if (typeof HTMLDialogElement === 'undefined') {
      return Promise.resolve(window.confirm(o.pesan || o.judul));
    }

    return new Promise((selesai) => {
      const dialog = buat('dialog', 'kk-dialog' + (o.bahaya ? ' kk-dialog-bahaya' : ''));
      dialog.setAttribute('aria-labelledby', 'kk-dialog-judul');
      dialog.setAttribute('aria-describedby', 'kk-dialog-pesan');

      const ikon = buat('div', 'kk-dialog-ikon');
      ikon.innerHTML = o.bahaya ? IKON_PERINGATAN : IKON_INFO;

      const judul = buat('h2', 'kk-dialog-judul', o.judul);
      judul.id = 'kk-dialog-judul';

      const pesan = buat('p', 'kk-dialog-pesan', o.pesan);
      pesan.id = 'kk-dialog-pesan';

      const aksi = buat('div', 'kk-dialog-aksi');
      const tombolTidak = buat('button', 'kk-dialog-tidak', o.labelTidak);
      tombolTidak.type = 'button';
      const tombolYa = buat('button', 'kk-dialog-ya', o.labelYa);
      tombolYa.type = 'button';
      aksi.append(tombolTidak, tombolYa);

      dialog.append(ikon, judul, pesan, aksi);
      document.body.append(dialog);

      let hasil = false;
      tombolYa.addEventListener('click', () => {
        hasil = true;
        dialog.close();
      });
      tombolTidak.addEventListener('click', () => dialog.close());

      // klik area gelap di luar kotak dialog = batal
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });

      // Esc, tombol batal, dan klik luar semua berakhir di sini
      dialog.addEventListener('close', () => {
        dialog.remove();
        selesai(hasil);
      });

      dialog.showModal();
      // fokus awal di tombol aman (batal), supaya Enter tidak tidak sengaja menghapus
      tombolTidak.focus();
    });
  };
})();
