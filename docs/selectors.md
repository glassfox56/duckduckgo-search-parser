# DuckDuckGo HTML Selector Catalog

Dokumentasi ini merangkum selector dan pattern markup yang terlihat di `https://duckduckgo.com/html/?q=<query>` (folder `samples/html-*.html`). File contoh yang dianalisis:

- `samples/html-openclaw.html` → pencarian kata kunci umum.
- `samples/html-weather-Jakarta.html` → cuplikan hasil cuaca (ad pertama + optional snippet).
- `samples/html-OpenAI-news.html` → fokus berita yang menyertakan metadata tanggal.

## 1. Struktur utama hasil pencarian

- **Kontainer hasil**: `<div class="serp__results">` berisi `<div id="links" class="results">`. Parser bisa mulai dari sini untuk memastikan kita berada di wilayah hasil web.
- **Blok hasil “web result” standar**:
  ```html
  <div class="result results_links results_links_deep web-result ">
    <div class="links_main links_deep result__body">
      ...
    </div>
  </div>
  ```
  Gunakan selector kombinasi `div.result.results_links` + `div.result__body` untuk iterasi.

### Ekstraksi detail per hasil

| Field | Selector | Catatan |
| --- | --- | --- |
| Judul link | `h2.result__title > a.result__a` | `textContent` adalah judul; `href` merupakan link penerusan via `duckduckgo.com/l/?uddg=`.
| URL bersih | `div.result__extras__url > a.result__url` | Mengandung versi tampilan (tanpa penjelasan `uddg`). Simpan `textContent` plus `href` bila perlu.
| Cuplikan | `a.result__snippet` | Anchor yang membungkus snippet penuh (beberapa hasil menggunakan `<b>` untuk sorotan). Berguna untuk deskripsi.
| Favicon | `img.result__icon__img` | Di dalam `div.result__icon` (opsional, ads sering menonaktifkan ikon). Bisa dilewati jika tidak perlu.
| Metadata tambahan | `div.result__extras__url span` | Untuk hasil berita, DuckDuckGo menambahkan `<span> 2026-02-... </span>` setelah URL; ambil teks ini sebagai `date`/`publishedAt`.

### Ads & label

- **Penandaan iklan**: hasil iklan memiliki kelas tambahan `result--ad` dan di dalam `result__title` ada `<button class="badge--ad">Ad</button>`.
- Parser bisa deteksi `div.result--ad` atau kehadiran `button.badge--ad` untuk memberi flag `isAd: true`.

### Instant answer / zero-click

Sebagian pencarian (misal `openclaw`) menampilkan block `zero-click` di atas hasil web:

```html
<div class="zci">
  <h1 class="zci__heading"><a href="https://...">OpenClaw</a></h1>
  <div class="zci__result" id="zero_click_abstract">
    <a class="zci__image"
    ...>
    <p>OpenClaw is ...</p>
    <a href="https://en.wikipedia.org/wiki/OpenClaw">More at Wikipedia</a>
  </div>
</div>
```

- Gunakan `div.zci` untuk mendeteksi jawaban instan.
- `h1.zci__heading > a` memberikan judul dan link sumber utama.
- `div.zci__result` berisi `img.zci__image` (jika ada) dan paragraf teks.
- `<a>` tambahan di bawah (`More at ...`) biasanya di dalam `div.zci__result` sebagai `anchor` dengan rel `nofollow`.

### Berita / news metadata (contoh `OpenAI news`)

- Hasil berita masih mengikuti struktur hasil web biasa tetapi menambahkan `<span> 2026-02-... </span>` setelah URL untuk tanggal.
- Cukup ambil teks `span` tersebut, pangkas `&nbsp;` dan `T` untuk mendapatkan timestamp ISO.

### Gagal markup (fallback)

Saat JavaScript tidak dijalankan, DuckDuckGo masih memuat definisi data di `script` berikut:

```js
DDG.duckbar.add({"data": {... "Results": [{"Result": "<a ...>...</a>", "Text": "..."}] ... }});
```

Jika suatu saat hasil DOM tidak tersedia, parser bisa fallback dengan mencari `<script>` yang memuat `DDG.duckbar.add` (lihat `samples/duckduckgo-standard.html`) lalu mengekstrak JSON untuk `Results` dan `RelatedTopics`.

## 2. Catatan teknis

- Selalu periksa `div.serp__results` sebelum mengambil data agar tidak mengganggu form atau zero-click.
- Gunakan `cheerio`/`jsdom` untuk mengeksekusi selector CSS di atas (tidak perlu menjalankan JavaScript).
- Tambahkan caching sederhana jika query sama berulang kali (HTML cenderung identik dalam satu sesi). Simpan raw HTML/Keterangan HTTP header (lihat `cookies-*.txt`) bila perlu debug.
- Tangani status tidak ditemukan (empty `.results`) dengan memberikan pesan fallback ke pengguna.
- Hindari mengirim credential langsung ke DuckDuckGo; semua parameter sensitif (seperti `uddg`) cukup disimpan sebagai data response tanpa memodifikasinya.

Catatan ini cukup untuk tahap awal parser — setelah modul berjalan, kita bisa memperluas ke `div.related-searches` atau `tabs` lainnya (News, Videos, Images) bila diperlukan.
