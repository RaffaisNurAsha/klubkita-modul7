/**
 * interaksi.js — Fitur Search & Filter Event via Supabase (Anggota 3: JavaScript/Interaksi)
 *
 * Cara kerja:
 * 1. Saat halaman 02 atau 03 dimuat, script membaca parameter URL
 *    (q, olahraga, hari, lokasi) dan mengisi form filter.
 * 2. Data event diambil dari tabel "kegiatan" di Supabase dengan filter:
 *      - q (search)    → ilike pada kolom judul dan lokasi
 *      - olahraga      → eq pada kolom kategori
 *      - hari          → filter berdasarkan hari dari kolom tanggal
 *      - lokasi        → ilike pada kolom lokasi
 * 3. Saat user klik "Terapkan", form TIDAK submit ke server (preventDefault).
 *    Sebaliknya, query Supabase dijalankan ulang dengan filter baru.
 * 4. Teks "Filter aktif: ..." diperbarui otomatis sesuai filter yang dipilih.
 * 5. Tombol "Reset" mengosongkan filter dan memuat ulang semua event.
 * 6. Loading state, empty state, dan error state ditampilkan memakai
 *    fungsi dari ui-state.js.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Guard: hanya jalankan di halaman 02 atau 03 ===
  var formFilter = document.getElementById("form-filter");
  var containerEvent = document.getElementById("daftar-event-container");
  var statusEvent = document.getElementById("status-event");
  if (!formFilter || !containerEvent) {
    return;
  }

  // === Ambil elemen-elemen filter dari DOM ===
  var inputCari = document.getElementById("cari");
  var selectOlahraga = document.getElementById("olahraga");
  var selectHari = document.getElementById("hari");
  var inputLokasi = document.getElementById("lokasi");
  var filterAktifText = document.getElementById("filter-aktif");

  // Peta nama hari → index JS (0=Minggu, 1=Senin, ..., 6=Sabtu)
  var HARI_KE_INDEX = {
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
  };

  /**
   * Menghapus semua elemen <article> dari containerEvent
   * tanpa menghapus elemen lain (h2, p status, dll).
   */
  function hapusArticles() {
    var articles = containerEvent.querySelectorAll("article");
    for (var i = 0; i < articles.length; i++) {
      articles[i].remove();
    }
  }

  /**
   * Membuat satu kartu event (article) dari data kegiatan Supabase.
   * Struktur HTML dibuat sama persis dengan kartu statis aslinya
   * agar CSS existing tetap bekerja.
   */
  function buatCardEvent(k) {
    var article = document.createElement("article");

    // Gambar
    var img = document.createElement("img");
    img.src = k.gambar_url || "./assets/images/futsal.webp";
    img.alt = "Kegiatan " + (k.judul || "");

    // Tanggal (h3)
    var h3 = document.createElement("h3");
    h3.textContent = formatTanggal(k.tanggal);

    // Judul event (h4)
    var h4 = document.createElement("h4");
    h4.textContent = k.judul || "";

    // Info waktu & lokasi (p pertama)
    var pInfo = document.createElement("p");
    var waktu = formatJam(k.jam_mulai) + " - " + formatJam(k.jam_selesai) + " WIB";
    pInfo.textContent = waktu + " - " + (k.lokasi || "-");

    // Link detail (p kedua)
    var pLink = document.createElement("p");
    var link = document.createElement("a");
    link.href = "04-detail-event.html?id=" + k.id;
    link.textContent = "Lihat Detail";
    pLink.appendChild(link);

    article.append(img, h3, h4, pInfo, pLink);
    return article;
  }

  /**
   * Render daftar event ke container.
   */
  function renderEvents(data) {
    hapusArticles();

    if (!data || data.length === 0) {
      if (statusEvent) {
        tampilkanEmpty(statusEvent, "Tidak ada kegiatan yang cocok dengan filter.");
      }
      return;
    }

    if (statusEvent) {
      statusEvent.textContent = "";
      statusEvent.replaceChildren();
    }

    for (var i = 0; i < data.length; i++) {
      containerEvent.appendChild(buatCardEvent(data[i]));
    }
  }

  /**
   * Update teks badge "Filter aktif" di halaman 03.
   */
  function updateFilterAktif(q, olahraga, hari, lokasi) {
    if (!filterAktifText) return;

    var bagian = [];
    if (q) bagian.push('"' + q + '"');
    if (olahraga) {
      bagian.push(olahraga.charAt(0).toUpperCase() + olahraga.slice(1));
    }
    if (hari) {
      bagian.push(hari.charAt(0).toUpperCase() + hari.slice(1));
    }
    if (lokasi) bagian.push(lokasi);

    if (bagian.length > 0) {
      filterAktifText.textContent = "Filter aktif: " + bagian.join(", ");
    } else {
      filterAktifText.textContent = "Menampilkan semua kegiatan";
    }
  }

  /**
   * Mengambil data dari Supabase berdasarkan filter aktif.
   * Kolom yang digunakan (terverifikasi dari beranda.js dan detail.js):
   *   - id, judul, kategori, tanggal, jam_mulai, jam_selesai,
   *     lokasi, gambar_url
   */
  async function muatEvent() {
    // Baca nilai filter saat ini dari form
    var q = inputCari ? inputCari.value.trim() : "";
    var olahraga = selectOlahraga ? selectOlahraga.value.toLowerCase() : "";
    var hari = selectHari ? selectHari.value.toLowerCase() : "";
    var lokasi = inputLokasi ? inputLokasi.value.trim() : "";

    // Update badge filter
    updateFilterAktif(q, olahraga, hari, lokasi);

    // Tampilkan loading
    hapusArticles();
    if (statusEvent) {
      tampilkanLoading(statusEvent, "Memuat kegiatan...");
    }

    // Timeout 10 detik
    var kontrol = new AbortController();
    var timer = setTimeout(function () { kontrol.abort(); }, 10000);

    // Bangun query Supabase
    var query = db
      .from("kegiatan")
      .select("id, judul, kategori, tanggal, jam_mulai, jam_selesai, lokasi, gambar_url")
      .order("tanggal")
      .order("jam_mulai")
      .abortSignal(kontrol.signal);

    // Filter: pencarian keyword (q) → cari di judul ATAU lokasi
    if (q) {
      query = query.or(
        "judul.ilike.%" + q + "%,lokasi.ilike.%" + q + "%"
      );
    }

    // Filter: kategori olahraga
    if (olahraga) {
      query = query.ilike("kategori", olahraga);
    }

    // Filter: lokasi (partial match)
    if (lokasi) {
      query = query.ilike("lokasi", "%" + lokasi + "%");
    }

    var result = await query;
    clearTimeout(timer);

    if (result.error) {
      var pesan = kontrol.signal.aborted
        ? "Koneksi terlalu lama. Coba lagi ya."
        : "Gagal memuat kegiatan. Periksa koneksi internet kamu.";
      if (statusEvent) {
        tampilkanError(statusEvent, pesan, muatEvent);
      }
      return;
    }

    var data = result.data || [];

    // Filter hari di sisi klien (Supabase tidak punya extract(dow) via JS client)
    if (hari && HARI_KE_INDEX[hari] !== undefined) {
      var targetDow = HARI_KE_INDEX[hari];
      data = data.filter(function (k) {
        var parts = k.tanggal.split("-").map(Number);
        var dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        return dateObj.getDay() === targetDow;
      });
    }

    if (statusEvent) {
      statusEvent.textContent = "";
      statusEvent.replaceChildren();
    }

    // Bersihkan articles lama sebelum render
    hapusArticles();
    renderEvents(data);
  }

  // === Baca parameter URL dan isi form filter saat halaman dimuat ===
  var params = new URLSearchParams(window.location.search);

  if (params.has("q") && inputCari) {
    inputCari.value = params.get("q") || "";
  }
  if (params.has("olahraga") && selectOlahraga) {
    selectOlahraga.value = (params.get("olahraga") || "").toLowerCase();
  }
  if (params.has("hari") && selectHari) {
    selectHari.value = (params.get("hari") || "").toLowerCase();
  }
  if (params.has("lokasi") && inputLokasi) {
    inputLokasi.value = params.get("lokasi") || "";
  }

  // Muat event saat halaman pertama kali dibuka
  muatEvent();

  // === Event: Tombol "Terapkan" ===
  formFilter.addEventListener("submit", function (e) {
    var isHalaman02 =
      window.location.pathname.indexOf("02-kalender-event.html") !== -1 ||
      (!filterAktifText && formFilter.getAttribute("action") === "03-kalender-terfilter.html");

    if (isHalaman02) {
      // Biarkan form melakukan navigasi GET ke 03-kalender-terfilter.html membawa query params
      return;
    }

    e.preventDefault(); // Di halaman 03, cegah reload halaman
    muatEvent();
  });

  // === Event: Tombol "Reset" ===
  formFilter.addEventListener("reset", function () {
    // Timeout 0 agar nilai form sudah ter-reset sebelum kita proses
    setTimeout(function () {
      if (inputCari) inputCari.value = "";
      if (selectOlahraga) selectOlahraga.value = "";
      if (selectHari) selectHari.value = "";
      if (inputLokasi) inputLokasi.value = "";
      muatEvent();
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
 *      - Nama Lengkap  → tidak boleh kosong (setelah trim)
 *      - Nomor WhatsApp → tidak boleh kosong & harus format 08xx (10-15 digit)
 *      - Status Kehadiran → salah satu radio harus dipilih
 *      - Persetujuan    → checkbox harus dicentang
 * 3. Semua input teks di-trim (pangkas spasi awal/akhir) sebelum
 *    validasi dijalankan.
 * 4. Jika ada kesalahan, pesan error muncul tepat di bawah field
 *    yang bermasalah (elemen <small> berwarna merah), dan toast
 *    notifikasi muncul sebagai ringkasan.
 * 5. Pesan error inline otomatis dihapus saat user mulai
 *    memperbaiki input (event input/change).
 * 6. Submit ganda dicegah dengan flag sedangSubmit dan
 *    menonaktifkan tombol selama proses berlangsung.
 * 7. Jika semua valid, form diarahkan (redirect) ke 06-konfirmasi-rsvp.html
 *    beserta query-string berisi data yang diisi user.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Guard: hanya jalankan di halaman Form RSVP ===
  var formRSVP = document.querySelector('form[action="06-konfirmasi-rsvp.html"]');
  if (!formRSVP) {
    return; // Bukan halaman RSVP, hentikan
  }

  // Nonaktifkan validasi bawaan browser agar kontrol sepenuhnya dipegang JavaScript
  formRSVP.noValidate = true;

  // === Ambil elemen field ===
  var inputNama = document.getElementById("nama-lengkap");
  var inputWA = document.getElementById("nomor-whatsapp");
  var inputPersetujuan = document.getElementById("persetujuan");
  var inputCatatan = document.getElementById("catatan");
  var tombolSubmit = formRSVP.querySelector('button[type="submit"]');
  var teksSubmitAsli = tombolSubmit ? tombolSubmit.textContent : "Kirim RSVP";

  // Flag pencegah submit ganda
  var sedangSubmit = false;

  /**
   * Hapus pesan error sebelumnya dari sebuah field dan hapus highlight error.
   * Pesan error dikenali lewat class "pesan-error".
   */
  function hapusError(field) {
    if (!field) return;
    field.classList.remove("input-error");
    var parent = field.parentNode;
    if (parent) {
      parent.classList.remove("input-error");
      var errorLama = parent.querySelector(".pesan-error");
      if (errorLama) {
        parent.removeChild(errorLama);
      }
    }
  }

  /**
   * Tampilkan pesan error di bawah field tertentu dan tambahkan highlight error.
   * Menggunakan elemen <small> agar tidak mengubah struktur signifikan.
   */
  function tampilkanErrorField(field, pesan) {
    if (!field) return;
    hapusError(field);
    field.classList.add("input-error");
    var el = document.createElement("small");
    el.className = "pesan-error";
    el.setAttribute("role", "alert");
    el.textContent = pesan;
    field.parentNode.appendChild(el);
  }

  /**
   * Hapus semua pesan error dan kelas highlight yang ada di dalam form.
   */
  function hapusSemuaError() {
    var semuaError = formRSVP.querySelectorAll(".pesan-error");
    for (var i = 0; i < semuaError.length; i++) {
      if (semuaError[i].parentNode) {
        semuaError[i].parentNode.removeChild(semuaError[i]);
      }
    }
    var semuaBermasalah = formRSVP.querySelectorAll(".input-error");
    for (var j = 0; j < semuaBermasalah.length; j++) {
      semuaBermasalah[j].classList.remove("input-error");
    }
  }

  /**
   * Validasi format nomor WhatsApp:
   * - Mendukung format 08xx atau format internasional (+628 / 628)
   * - Panjang 10–15 karakter (hanya digit, spasi & strip diabaikan)
   */
  function validasiNomorWA(nomor) {
    var angkaSaja = nomor.replace(/[\s\-\+]/g, ""); // Buang spasi, strip, & plus
    if (angkaSaja.indexOf("628") === 0) {
      angkaSaja = "0" + angkaSaja.slice(2);
    }
    var pola = /^08\d{8,13}$/; // 08 + 8-13 digit = total 10-15 digit
    return pola.test(angkaSaja);
  }

  /**
   * Trim semua input teks di dalam form.
   * Mengembalikan nilai yang sudah di-trim ke field sehingga
   * user melihat hasil trim-nya.
   */
  function trimSemuaInput() {
    if (inputNama) {
      inputNama.value = inputNama.value.trim();
    }
    if (inputWA) {
      inputWA.value = inputWA.value.trim();
    }
    if (inputCatatan) {
      inputCatatan.value = inputCatatan.value.trim();
    }
  }

  // === Live clearing: hapus pesan error saat user mulai memperbaiki ===
  if (inputNama) {
    inputNama.addEventListener("input", function () {
      hapusError(inputNama);
    });
  }
  if (inputWA) {
    inputWA.addEventListener("input", function () {
      hapusError(inputWA);
    });
  }
  if (inputPersetujuan) {
    inputPersetujuan.addEventListener("change", function () {
      hapusError(inputPersetujuan);
    });
  }

  // Live clearing untuk radio kehadiran
  var radioKehadiranAll = formRSVP.querySelectorAll(
    'input[name="status_kehadiran"]'
  );
  var fieldsetKehadiran = radioKehadiranAll.length > 0
    ? radioKehadiranAll[0].closest("fieldset")
    : null;
  for (var r = 0; r < radioKehadiranAll.length; r++) {
    radioKehadiranAll[r].addEventListener("change", function () {
      if (fieldsetKehadiran) {
        hapusError(fieldsetKehadiran);
      }
    });
  }

  /**
   * Mengaktifkan kembali tombol submit setelah proses selesai.
   */
  function resetTombolSubmit() {
    sedangSubmit = false;
    if (tombolSubmit) {
      tombolSubmit.disabled = false;
      tombolSubmit.textContent = teksSubmitAsli;
    }
  }

  // Baca ID kegiatan dari parameter URL
  var urlParams = new URLSearchParams(window.location.search);
  var kegiatanId = Number(urlParams.get("id")) || 1;

  // Cek apakah user sudah login, dan isi otomatis nama jika tersedia
  if (typeof db !== "undefined" && db.auth) {
    db.auth.getUser().then(function (res) {
      if (res && res.data && res.data.user) {
        if (inputNama && !inputNama.value && res.data.user.user_metadata && res.data.user.user_metadata.nama_lengkap) {
          inputNama.value = res.data.user.user_metadata.nama_lengkap;
        }
      }
    }).catch(function () {});
  }

  // === Event: Submit form RSVP ===
  formRSVP.addEventListener("submit", async function (e) {
    e.preventDefault(); // Cegah submit bawaan browser

    // Cegah submit ganda
    if (sedangSubmit) {
      return;
    }

    hapusSemuaError();
    trimSemuaInput();

    var valid = true;
    var fieldPertamaError = null;
    var jumlahError = 0;

    // 1. Validasi Nama Lengkap (wajib, tidak boleh kosong setelah trim)
    if (!inputNama || inputNama.value === "") {
      tampilkanErrorField(inputNama, "Nama lengkap wajib diisi.");
      valid = false;
      jumlahError++;
      if (!fieldPertamaError) fieldPertamaError = inputNama;
    }

    // 2. Validasi Nomor WhatsApp (wajib + format 08xx)
    if (!inputWA || inputWA.value === "") {
      tampilkanErrorField(inputWA, "Nomor WhatsApp wajib diisi.");
      valid = false;
      jumlahError++;
      if (!fieldPertamaError) fieldPertamaError = inputWA;
    } else if (!validasiNomorWA(inputWA.value)) {
      tampilkanErrorField(
        inputWA,
        "Format nomor tidak valid. Gunakan format 08xx, 10–15 digit angka. Contoh: 081234567890"
      );
      valid = false;
      jumlahError++;
      if (!fieldPertamaError) fieldPertamaError = inputWA;
    }

    // 3. Validasi Status Kehadiran (salah satu radio harus dipilih)
    var kehadiranDipilih = formRSVP.querySelector(
      'input[name="status_kehadiran"]:checked'
    );

    if (!kehadiranDipilih) {
      if (fieldsetKehadiran) {
        tampilkanErrorField(fieldsetKehadiran, "Pilih status kehadiran.");
      }
      valid = false;
      jumlahError++;
      if (!fieldPertamaError && radioKehadiranAll.length > 0) {
        fieldPertamaError = radioKehadiranAll[0];
      }
    }

    // 4. Validasi Persetujuan (checkbox wajib dicentang)
    if (!inputPersetujuan || !inputPersetujuan.checked) {
      tampilkanErrorField(
        inputPersetujuan,
        "Anda harus menyetujui ketentuan & kode etik komunitas."
      );
      valid = false;
      jumlahError++;
      if (!fieldPertamaError) fieldPertamaError = inputPersetujuan;
    }

    // === Jika validasi gagal → tampilkan toast error dan fokuskan field pertama ===
    // (JANGAN KIRIM DATA KE DATABASE JIKA VALIDASI GAGAL)
    if (!valid) {
      if (typeof tampilkanToast === "function") {
        tampilkanToast(
          "Terdapat " + jumlahError + " kesalahan pada formulir. Silakan periksa kembali.",
          "error"
        );
      }
      // Scroll dan fokus ke field pertama yang bermasalah
      if (fieldPertamaError) {
        fieldPertamaError.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof fieldPertamaError.focus === "function") {
          fieldPertamaError.focus({ preventScroll: true });
        }
      }
      return;
    }

    // === Cegah submit ganda: nonaktifkan tombol & ubah teks ===
    sedangSubmit = true;
    if (tombolSubmit) {
      tombolSubmit.disabled = true;
      tombolSubmit.textContent = "Menyimpan ke database...";
    }

    // Periksa kesiapan client Supabase
    if (typeof db === "undefined" || !db.from) {
      resetTombolSubmit();
      var pesanNoDb = "Layanan database belum siap. Silakan muat ulang halaman atau periksa koneksi.";
      if (typeof tampilkanToast === "function") {
        tampilkanToast(pesanNoDb, "error");
      }
      tampilkanErrorField(tombolSubmit, pesanNoDb);
      return;
    }

    // Ambil data user yang sedang login (jika ada) untuk memenuhi kebijakan RLS
    var currentUserId = null;
    if (db.auth && typeof db.auth.getUser === "function") {
      try {
        var userRes = await db.auth.getUser();
        if (userRes && userRes.data && userRes.data.user) {
          currentUserId = userRes.data.user.id;
        }
      } catch (authErr) {
        console.warn("Pengecekan auth:", authErr);
      }
    }

    // Siapkan payload RSVP untuk tabel pendaftaran
    var waClean = inputWA.value.replace(/[\s\-\+]/g, "");
    if (waClean.indexOf("628") === 0) {
      waClean = "0" + waClean.slice(2);
    }

    var payload = {
      kegiatan_id: kegiatanId,
      nama_lengkap: inputNama.value,
      nomor_whatsapp: waClean,
      status_kehadiran: kehadiranDipilih.value,
      catatan: inputCatatan && inputCatatan.value !== "" ? inputCatatan.value : null
    };

    if (currentUserId) {
      payload.user_id = currentUserId;
    }

    // Kirim data ke Supabase tabel "pendaftaran"
    try {
      var res = await db.from("pendaftaran").insert([payload]).select();

      // Jika Supabase mengembalikan error
      if (res.error) {
        console.error("Gagal menyimpan ke Supabase:", res.error);
        resetTombolSubmit();

        var pesanGagal = "Gagal menyimpan RSVP: " + (res.error.message || "Terjadi kesalahan server");
        if (
          res.error.code === "23505" ||
          (res.error.message && (res.error.message.indexOf("23505") !== -1 || res.error.message.indexOf("pendaftaran_user_id_kegiatan_id_key") !== -1))
        ) {
          pesanGagal = "Kamu sudah terdaftar pada kegiatan ini.";
        } else if (res.error.code === "42501") {
          pesanGagal = "Gagal menyimpan RSVP: Kebijakan keamanan database (RLS) mengharuskan Anda masuk (login) terlebih dahulu.";
        }

        if (typeof tampilkanToast === "function") {
          tampilkanToast(pesanGagal, "error");
        }
        tampilkanErrorField(tombolSubmit, pesanGagal);
        // Form tidak di-reset, user dapat mencoba lagi langsung
        return;
      }

      // === Penyimpanan Berhasil ===
      var rsvpTersimpan = res.data && res.data.length > 0 ? res.data[0] : null;

      // Simpan konteks konfirmasi tanpa mengekspos data sensitif di query string
      try {
        sessionStorage.setItem(
          "last_rsvp",
          JSON.stringify({
            id: rsvpTersimpan ? rsvpTersimpan.id : null,
            kegiatan_id: kegiatanId,
            status_kehadiran: kehadiranDipilih.value,
            timestamp: Date.now()
          })
        );
      } catch (storageErr) {
        console.warn("sessionStorage tidak didukung:", storageErr);
      }

      if (typeof tampilkanToast === "function") {
        tampilkanToast("RSVP berhasil disimpan ke database! Mengalihkan...", "success");
      }

      // Alihkan ke konfirmasi TANPA menyertakan nama dan nomor whatsapp di query string URL
      setTimeout(function () {
        window.location.href = "06-konfirmasi-rsvp.html?status_kehadiran=" + encodeURIComponent(kehadiranDipilih.value);
        resetTombolSubmit();
      }, 500);

    } catch (ex) {
      console.error("Exception saat submit RSVP:", ex);
      resetTombolSubmit();

      var pesanEx = "Terjadi kendala teknis koneksi database: " + (ex.message || "Gagal terhubung.");
      if (
        ex.code === "23505" ||
        (ex.message && (ex.message.indexOf("23505") !== -1 || ex.message.indexOf("pendaftaran_user_id_kegiatan_id_key") !== -1))
      ) {
        pesanEx = "Kamu sudah terdaftar pada kegiatan ini.";
      }
      if (typeof tampilkanToast === "function") {
        tampilkanToast(pesanEx, "error");
      }
      tampilkanErrorField(tombolSubmit, pesanEx);
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
 * 2. Membaca "status_kehadiran" dari URL query-string atau sessionStorage.
 *    - Nilai "hadir"       → tampilan tetap default (tiket & QR tampil).
 *    - Nilai "tidak_hadir" → judul & teks diubah jadi konfirmasi
 *      ketidakhadiran, lalu elemen yang tidak relevan (kode tiket,
 *      QR code, link "Simpan ke Kalender", dan teks reminder)
 *      disembunyikan.
 * 3. Jika tersedia ID dari sessionStorage, nomor tiket ditampilkan dinamis.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Guard: hanya jalankan di halaman Konfirmasi RSVP ===
  var judulKonfirmasi = document.getElementById("rsvp-berhasil");
  if (!judulKonfirmasi) {
    return; // Bukan halaman konfirmasi, hentikan
  }

  // === Baca status kehadiran dari query-string atau sessionStorage ===
  var params = new URLSearchParams(window.location.search);
  var statusKehadiran = params.get("status_kehadiran");

  if (!statusKehadiran) {
    try {
      var saved = JSON.parse(sessionStorage.getItem("last_rsvp") || "{}");
      if (saved && saved.status_kehadiran) {
        statusKehadiran = saved.status_kehadiran;
      }
    } catch (e) {}
  }

  // Tampilkan kode tiket dinamis jika tersedia ID dari pendaftaran Supabase
  try {
    var savedRsvp = JSON.parse(sessionStorage.getItem("last_rsvp") || "{}");
    if (savedRsvp && savedRsvp.id) {
      var tiketStrong = judulKonfirmasi.closest("section")
        ? judulKonfirmasi.closest("section").querySelector("p strong")
        : null;
      if (tiketStrong) {
        tiketStrong.textContent = "Kode Tiket: KLB-" + String(savedRsvp.id).padStart(5, "0");
      }
    }
  } catch (e) {}

  // Jika tidak ada status atau status "hadir", biarkan tampilan default hadir
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
