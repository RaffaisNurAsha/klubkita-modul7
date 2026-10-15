/**
 * interaksi.js — Fitur Filter Event (Anggota 3: JavaScript/Interaksi)
 *
 * Cara kerja:
 * 1. Saat halaman dimuat, script membaca semua <article> di section hasil filter.
 * 2. Saat user klik "Terapkan", form TIDAK submit ke server (preventDefault).
 *    Sebaliknya, script menyaring article berdasarkan 3 kriteria:
 *      - Olahraga (select#olahraga)  → dicocokkan dengan teks <h4> article
 *      - Hari     (input#hari)       → dicocokkan dengan teks <h3> article
 *      - Lokasi   (input#lokasi)     → dicocokkan dengan teks <p> detail article
 * 3. Article yang tidak cocok disembunyikan (display:none), yang cocok ditampilkan.
 * 4. Teks "Filter aktif: ..." diperbarui otomatis sesuai filter yang dipilih.
 * 5. Tombol "Reset" mengembalikan semua article dan mengosongkan filter.
 */

document.addEventListener("DOMContentLoaded", function () {
  // === Ambil elemen-elemen dari DOM ===
  var form = document.querySelector("form");
  var selectOlahraga = document.getElementById("olahraga");
  var inputHari = document.getElementById("hari");
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
    var hari = inputHari ? inputHari.value.trim().toLowerCase() : "";
    var lokasi = inputLokasi ? inputLokasi.value.trim().toLowerCase() : "";

    var jumlahTampil = 0;

    for (var i = 0; i < articles.length; i++) {
      var article = articles[i];

      // Ambil teks dari elemen-elemen dalam article
      var h4 = article.querySelector("h4");
      var h3 = article.querySelector("h3");
      var paragraphs = article.querySelectorAll("p");

      var teksOlahraga = h4 ? h4.textContent.toLowerCase() : "";
      var teksHari = h3 ? h3.textContent.toLowerCase() : "";

      // Lokasi ada di <p> pertama (yang berisi jam & tempat)
      var teksLokasi = "";
      if (paragraphs.length > 0) {
        teksLokasi = paragraphs[0].textContent.toLowerCase();
      }

      // Cek kecocokan masing-masing filter
      var cocokOlahraga =
        olahraga === "" || teksOlahraga.indexOf(olahraga) !== -1;
      var cocokHari = hari === "" || teksHari.indexOf(hari) !== -1;
      var cocokLokasi = lokasi === "" || teksLokasi.indexOf(lokasi) !== -1;

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
        bagianFilter.push(hari);
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

  // === Event: Tombol "Terapkan" ===
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Cegah reload halaman
    terapkanFilter();
  });

  // === Event: Tombol "Reset" ===
  form.addEventListener("reset", function () {
    // Timeout 0 agar nilai form sudah ter-reset sebelum kita proses
    setTimeout(function () {
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
