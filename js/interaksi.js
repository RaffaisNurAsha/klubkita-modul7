/**
 * interaksi.js — Fitur Filter Event (Anggota 3: JavaScript/Interaksi)
 *
 * Cara kerja:
 * 1. Saat halaman dimuat, script membaca semua <article> di section hasil filter.
 * 2. Saat user klik "Terapkan", form TIDAK submit ke server (preventDefault).
 *    Sebaliknya, script menyaring article berdasarkan 3 kriteria:
 *      - Olahraga (select#olahraga)  → dicocokkan dengan atribut data-olahraga article
 *      - Hari     (select#hari)      → dicocokkan dengan atribut data-hari article
 *      - Lokasi   (input#lokasi)     → dicocokkan dengan atribut data-lokasi article
 * 3. Article yang tidak cocok disembunyikan (display:none), yang cocok ditampilkan.
 * 4. Teks "Filter aktif: ..." diperbarui otomatis sesuai filter yang dipilih.
 * 5. Tombol "Reset" mengembalikan semua article dan mengosongkan filter.
 * 6. Saat halaman 03 dibuka, parameter URL (olahraga, hari, lokasi) dari 02
 *    dibaca, diisi ke filter, lalu filter langsung dijalankan.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Ambil elemen-elemen dari DOM ===
  var form = document.querySelector("form");
  var selectOlahraga = document.getElementById("olahraga");
  var selectHari = document.getElementById("hari");
  var inputLokasi = document.getElementById("lokasi");
  var sectionHasil = document.querySelector(
    'section[aria-labelledby="hasil-filter"]'
  );
  var articles = sectionHasil
    ? sectionHasil.querySelectorAll("article")
    : [];
  var filterAktifText = sectionHasil
    ? sectionHasil.querySelector("h2 + p")
    : null;

  // Guard: hentikan jika elemen penting tidak ditemukan
  if (!form || !sectionHasil || articles.length === 0) {
    return;
  }

  // === Fungsi utama: filter articles ===
  function terapkanFilter() {
    var olahraga = selectOlahraga ? selectOlahraga.value.toLowerCase() : "";
    var hari = selectHari ? selectHari.value.toLowerCase() : "";
    var lokasi = inputLokasi ? inputLokasi.value.trim().toLowerCase() : "";

    var jumlahTampil = 0;

    for (var i = 0; i < articles.length; i++) {
      var article = articles[i];

      // Ambil data dari atribut data-*
      var dataOlahraga = (article.getAttribute("data-olahraga") || "").toLowerCase();
      var dataHari = (article.getAttribute("data-hari") || "").toLowerCase();
      var dataLokasi = (article.getAttribute("data-lokasi") || "").toLowerCase();

      // Cek kecocokan masing-masing filter
      var cocokOlahraga = olahraga === "" || dataOlahraga === olahraga;
      var cocokHari = hari === "" || dataHari === hari;
      var cocokLokasi = lokasi === "" || dataLokasi.indexOf(lokasi) !== -1;

      // Tampilkan/sembunyikan article
      if (cocokOlahraga && cocokHari && cocokLokasi) {
        article.style.display = "";
        jumlahTampil++;
      } else {
        article.style.display = "none";
      }
    }

    // Update teks "Filter aktif"
    if (filterAktifText) {
      var bagianFilter = [];
      if (olahraga) {
        // Capitalize huruf pertama
        bagianFilter.push(
          olahraga.charAt(0).toUpperCase() + olahraga.slice(1)
        );
      }
      if (hari) {
        bagianFilter.push(
          hari.charAt(0).toUpperCase() + hari.slice(1)
        );
      }
      if (lokasi) {
        bagianFilter.push(lokasi);
      }

      if (bagianFilter.length > 0) {
        filterAktifText.textContent =
          "Filter aktif: " + bagianFilter.join(", ");
      } else {
        filterAktifText.textContent = "Menampilkan semua kegiatan";
      }

      // Tambahkan info jumlah jika tidak ada hasil
      if (jumlahTampil === 0) {
        filterAktifText.textContent +=
          " — Tidak ada kegiatan yang cocok dengan filter.";
      }
    }
  }

  // === Pastikan opsi "Semua" dan "Voli" tersedia di select olahraga jika ada ===
  if (selectOlahraga && !selectOlahraga.querySelector('option[value=""]')) {
    var optSemua = document.createElement("option");
    optSemua.value = "";
    optSemua.textContent = "Semua";
    selectOlahraga.insertBefore(optSemua, selectOlahraga.firstChild);
  }
  if (selectOlahraga && !selectOlahraga.querySelector('option[value="voli"]')) {
    var optVoli = document.createElement("option");
    optVoli.value = "voli";
    optVoli.textContent = "Voli";
    selectOlahraga.appendChild(optVoli);
  }

  // === Baca parameter URL dan isi filter saat halaman dimuat ===
  var params = new URLSearchParams(window.location.search);
  var hasParamOlahraga = params.has("olahraga");
  var hasParamHari = params.has("hari");
  var hasParamLokasi = params.has("lokasi");

  if (hasParamOlahraga || hasParamHari || hasParamLokasi) {
    if (hasParamOlahraga && selectOlahraga) {
      selectOlahraga.value = (params.get("olahraga") || "").toLowerCase();
    }
    if (hasParamHari && selectHari) {
      selectHari.value = (params.get("hari") || "").toLowerCase();
    }
    if (hasParamLokasi && inputLokasi) {
      inputLokasi.value = params.get("lokasi") || "";
    }
    terapkanFilter();
  } else {
    // Jalankan filter awal saat halaman 03 dibuka langsung
    terapkanFilter();
  }

  // === Event: Tombol "Terapkan" ===
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Cegah reload halaman
    terapkanFilter();
  });

  // === Event: Tombol "Reset" ===
  form.addEventListener("reset", function () {
    // Timeout 0 agar nilai form sudah ter-reset sebelum kita proses
    setTimeout(function () {
      if (selectOlahraga) selectOlahraga.value = "";
      if (selectHari) selectHari.value = "";
      if (inputLokasi) inputLokasi.value = "";
      // Tampilkan kembali semua article
      for (var i = 0; i < articles.length; i++) {
        articles[i].style.display = "";
      }
      // Kembalikan teks filter aktif
      if (filterAktifText) {
        filterAktifText.textContent = "Menampilkan semua kegiatan";
      }
    }, 0);
  });
});


/**
 * ============================================================
 * VALIDASI FORM RSVP (Anggota 3: JavaScript/Interaksi)
 * ============================================================
 *
 * Cara kerja:
 * 1. Script hanya aktif di halaman yang memiliki form dengan
 *    action mengarah ke "06-konfirmasi-rsvp.html" (guard clause).
 * 2. Saat user klik "Kirim RSVP", submit dicegah (preventDefault)
 *    lalu setiap field wajib divalidasi satu per satu:
 *      - Nama Lengkap  → tidak boleh kosong
 *      - Nomor WhatsApp → tidak boleh kosong & harus format 08xx (10-15 digit)
 *      - Status Kehadiran → salah satu radio harus dipilih
 *      - Persetujuan    → checkbox harus dicentang
 * 3. Jika ada kesalahan, pesan error muncul tepat di bawah field
 *    yang bermasalah (elemen <small> berwarna merah).
 * 4. Jika semua valid, form diarahkan (redirect) ke 06-konfirmasi-rsvp.html
 *    beserta query-string berisi data yang diisi user.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Guard: hanya jalankan di halaman Form RSVP ===
  var formRSVP = document.querySelector('form[action="06-konfirmasi-rsvp.html"]');
  if (!formRSVP) {
    return; // Bukan halaman RSVP, hentikan
  }

  // === Ambil elemen field ===
  var inputNama = document.getElementById("nama-lengkap");
  var inputWA = document.getElementById("nomor-whatsapp");
  var inputPersetujuan = document.getElementById("persetujuan");

  /**
   * Hapus pesan error sebelumnya dari sebuah field.
   * Pesan error dikenali lewat class "pesan-error".
   */
  function hapusError(field) {
    // field bisa berupa input biasa atau fieldset (untuk radio)
    var parent = field.parentNode;
    var errorLama = parent.querySelector(".pesan-error");
    if (errorLama) {
      parent.removeChild(errorLama);
    }
  }

  /**
   * Tampilkan pesan error di bawah field tertentu.
   * Menggunakan elemen <small> agar tidak mengubah struktur signifikan.
   */
  function tampilkanError(field, pesan) {
    hapusError(field);
    var el = document.createElement("small");
    el.className = "pesan-error";
    el.style.color = "#d32f2f";
    el.style.display = "block";
    el.style.marginTop = "4px";
    el.textContent = pesan;
    field.parentNode.appendChild(el);
  }

  /**
   * Hapus semua pesan error yang ada di dalam form.
   */
  function hapusSemuaError() {
    var semuaError = formRSVP.querySelectorAll(".pesan-error");
    for (var i = 0; i < semuaError.length; i++) {
      semuaError[i].parentNode.removeChild(semuaError[i]);
    }
  }

  /**
   * Validasi format nomor WhatsApp:
   * - Harus dimulai dengan "08"
   * - Panjang 10–15 karakter (hanya digit)
   */
  function validasiNomorWA(nomor) {
    var angkaSaja = nomor.replace(/[\s\-]/g, ""); // Buang spasi & strip
    var pola = /^08\d{8,13}$/; // 08 + 8-13 digit = total 10-15 digit
    return pola.test(angkaSaja);
  }

  // === Event: Submit form RSVP ===
  formRSVP.addEventListener("submit", function (e) {
    e.preventDefault(); // Cegah submit bawaan browser
    hapusSemuaError();

    var valid = true;

    // 1. Validasi Nama Lengkap (wajib, tidak boleh kosong)
    if (!inputNama || inputNama.value.trim() === "") {
      tampilkanError(inputNama, "Nama lengkap wajib diisi.");
      valid = false;
    }

    // 2. Validasi Nomor WhatsApp (wajib + format 08xx)
    if (!inputWA || inputWA.value.trim() === "") {
      tampilkanError(inputWA, "Nomor WhatsApp wajib diisi.");
      valid = false;
    } else if (!validasiNomorWA(inputWA.value)) {
      tampilkanError(
        inputWA,
        "Format nomor tidak valid. Gunakan format 08xx (10–15 digit)."
      );
      valid = false;
    }

    // 3. Validasi Status Kehadiran (salah satu radio harus dipilih)
    var radioKehadiran = formRSVP.querySelectorAll(
      'input[name="status_kehadiran"]'
    );
    var kehadiranDipilih = formRSVP.querySelector(
      'input[name="status_kehadiran"]:checked'
    );
    // Tampilkan error di fieldset induk radio
    var fieldsetKehadiran = radioKehadiran.length > 0
      ? radioKehadiran[0].closest("fieldset")
      : null;

    if (!kehadiranDipilih) {
      if (fieldsetKehadiran) {
        tampilkanError(fieldsetKehadiran, "Pilih status kehadiran.");
      }
      valid = false;
    }

    // 4. Validasi Persetujuan (checkbox wajib dicentang)
    if (!inputPersetujuan || !inputPersetujuan.checked) {
      tampilkanError(
        inputPersetujuan,
        "Anda harus menyetujui ketentuan & kode etik komunitas."
      );
      valid = false;
    }

    // === Jika semua valid → redirect ke halaman konfirmasi ===
    if (valid) {
      // Bangun query-string dari data form
      var params = [];
      params.push("nama_lengkap=" + encodeURIComponent(inputNama.value.trim()));
      params.push(
        "nomor_whatsapp=" +
          encodeURIComponent(inputWA.value.replace(/[\s\-]/g, ""))
      );
      if (kehadiranDipilih) {
        params.push(
          "status_kehadiran=" + encodeURIComponent(kehadiranDipilih.value)
        );
      }
      var catatan = document.getElementById("catatan");
      if (catatan && catatan.value.trim() !== "") {
        params.push("catatan=" + encodeURIComponent(catatan.value.trim()));
      }
      params.push("persetujuan=on");

      window.location.href = "06-konfirmasi-rsvp.html?" + params.join("&");
    }
  });
});

/**
 * ============================================================
 * TAMPILAN DINAMIS HALAMAN KONFIRMASI RSVP (Anggota 3)
 * ============================================================
 *
 * Cara kerja:
 * 1. Guard clause: kode hanya jalan jika ada elemen #rsvp-berhasil
 *    (yang hanya ada di halaman 06-konfirmasi-rsvp.html).
 * 2. Membaca query-string "status_kehadiran" dari URL.
 *    - Nilai "hadir"       → tampilan tetap default (tidak diubah).
 *    - Nilai "tidak_hadir" → judul & teks diubah jadi konfirmasi
 *      ketidakhadiran, lalu elemen yang tidak relevan (kode tiket,
 *      QR code, link "Simpan ke Kalender", dan teks reminder)
 *      disembunyikan.
 *    - Tanpa query-string  → tampilan dibiarkan default.
 * 3. Tidak mengubah struktur HTML; hanya memanipulasi textContent
 *    dan display style via JavaScript.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Guard: hanya jalankan di halaman Konfirmasi RSVP ===
  var judulKonfirmasi = document.getElementById("rsvp-berhasil");
  if (!judulKonfirmasi) {
    return; // Bukan halaman konfirmasi, hentikan
  }

  // === Baca query-string dari URL ===
  var params = new URLSearchParams(window.location.search);
  var statusKehadiran = params.get("status_kehadiran");

  // Jika tidak ada query-string atau status "hadir", biarkan default
  if (!statusKehadiran || statusKehadiran === "hadir") {
    return;
  }

  // === Status "tidak_hadir": sesuaikan tampilan ===
  if (statusKehadiran === "tidak_hadir") {
    // Ambil section induk
    var section = judulKonfirmasi.closest("section");
    if (!section) {
      return;
    }

    // 1. Ubah judul
    judulKonfirmasi.textContent = "KETIDAKHADIRAN DICATAT";

    // 2. Ubah paragraf deskripsi (paragraf pertama dalam section setelah h1)
    var paragraphs = section.querySelectorAll("p");
    // paragraphs[0] = teks deskripsi "Kamu berhasil mendaftar..."
    if (paragraphs.length > 0) {
      paragraphs[0].innerHTML =
        'Terima kasih sudah memberi tahu. Ketidakhadiranmu pada ' +
        '\u201cLatihan Futsal Mingguan\u201d sudah kami catat.';
    }

    // 3. Sembunyikan Kode Tiket (paragraf dengan <strong> berisi "Kode Tiket")
    var allStrong = section.querySelectorAll("p > strong");
    for (var i = 0; i < allStrong.length; i++) {
      if (allStrong[i].textContent.indexOf("Kode Tiket") !== -1) {
        allStrong[i].parentNode.style.display = "none";
        break;
      }
    }

    // 4. Sembunyikan QR Code (figure)
    var figure = section.querySelector("figure");
    if (figure) {
      figure.style.display = "none";
    }

    // 5. Sembunyikan link "Simpan ke Kalender" di dalam nav & lebarkan "Kembali ke Beranda"
    var navAksi = section.querySelector('nav[aria-label="Aksi setelah RSVP"]');
    if (navAksi) {
      var links = navAksi.querySelectorAll("a");
      for (var j = 0; j < links.length; j++) {
        if (links[j].textContent.indexOf("Simpan ke Kalender") !== -1) {
          // Sembunyikan <p> pembungkus link
          links[j].closest("p").style.display = "none";
        }
        if (links[j].textContent.indexOf("Kembali ke Beranda") !== -1) {
          // Atur grid-column 1 / -1 pada <p> pembungkus tombol agar memenuhi lebar penuh
          links[j].closest("p").style.gridColumn = "1 / -1";
        }
      }
    }

    // 6. Sembunyikan teks Reminder (paragraf terakhir yang mengandung "Reminder")
    for (var k = 0; k < paragraphs.length; k++) {
      if (paragraphs[k].textContent.indexOf("Reminder") !== -1) {
        paragraphs[k].style.display = "none";
        break;
      }
    }
  }
});
