# Uji manual NubiBuilds Dark

Satu langkah per bagian `CHECKLIST.md`. Tiap langkah menyebut **apa yang dibuka**, **apa yang harus terlihat**, dan **tanda gagal**. Setelah satu langkah lulus, ubah tanda `[~]` yang merujuk langkah itu menjadi `[x]` di `CHECKLIST.md`; kalau gagal, catat temuannya di sana.

Nama warna (`accent`, `amber`, dan seterusnya) mengacu ke palet di `scripts/build-theme.mjs`.

## T0. Persiapan

1. Di folder proyek, jalankan `npm run build && npm run check`. Keduanya harus selesai tanpa kegagalan.
2. Buka folder proyek di VS Code, lalu pilih menu **Run > Start Debugging** (konfigurasi **Run Extension**). Tombolnya `F5`; di keyboard Mac tekan `Fn+F5`, karena `F5` saja membuka Dictation. Jendela baru bertajuk *Extension Development Host* terbuka pada folder `samples/`.
3. Di jendela baru itu: `Cmd+Shift+P` → **Preferences: Color Theme** → **NubiBuilds Dark**. Ada tiga tema: **NubiBuilds Dark**, **NubiBuilds Dark Void** (semua area berlatar paling gelap) dan **NubiBuilds Dark Float** (editor lebih terang, sorotan lebih lemah). Di daftar itu, panah atas/bawah langsung mengganti tema tanpa Enter, jadi mudah dibandingkan. Jalankan semua langkah dengan NubiBuilds Dark; untuk Void dan Float cukup ulangi T1, T3, T6, T8 dan T9.
4. Pastikan semantic highlighting menyala: buka Settings, cari `editor.semanticHighlighting.enabled`, nilainya harus `true` atau `configuredByTheme` (tema ini menyalakannya sendiri).
5. Untuk memeriksa satu token: taruh kursor di token itu, lalu `Cmd+Shift+P` → **Developer: Inspect Editor Tokens and Scopes**. Kotak yang muncul menampilkan `foreground`, `font style`, daftar `textmate scopes`, dan, kalau language server menyediakannya, `semantic token type` beserta `modifiers`. Baris paling bawah menyebut aturan tema mana yang menang.
6. Disarankan menyalakan `workbench.editor.highlightModifiedTabs` supaya garis `amber` pada tab yang belum disimpan terlihat.

Setelah mengubah `scripts/build-theme.mjs`, jalankan `npm run build`, lalu di Extension Development Host jalankan **Developer: Reload Window**.

**Tanda gagal umum:** tema tidak muncul di daftar; ada bagian yang tetap berwarna abu-abu atau biru bawaan VS Code; `Developer: Toggle Developer Tools` → Console menampilkan peringatan tentang file tema.

## T1. Workbench UI

**Buka:** jendela Extension Development Host apa adanya, dengan dua atau tiga file dari `samples/` terbuka.

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| Activity Bar | Latar `bar`; ikon tidak aktif redup, ikon aktif terang dengan garis `accent` di tepinya; badge hijau dengan angka gelap | Ikon aktif hanya beda tipis dari yang lain; angka badge sulit dibaca |
| Side Bar (kiri) dan Secondary Side Bar (`View > Appearance > Secondary Side Bar`) | Latar `surface`, sedikit lebih terang dari editor; garis `line` memisahkannya dari editor; judul bagian lebih terang dari isi | Sidebar tampak menyatu dengan editor |
| Tab | Tab aktif berlatar sama dengan editor, teks terang, garis atas `accent`; tab lain berlatar `bar`, teks redup; hover menerangkan latar | Tab aktif sulit ditemukan |
| Tab belum disimpan | Ketik sesuatu tanpa menyimpan: titik pada tab, dan garis atas `amber` kalau `highlightModifiedTabs` menyala | Tidak ada tanda selain warna teks |
| Tab pinned dan grup tidak fokus | Pin satu tab (klik kanan → Pin); belah editor (`Cmd+\`): grup yang tidak fokus punya garis atas abu-kehijauan, bukan `accent` | Dua grup tampak sama-sama fokus |
| Drop target | Seret tab ke tepi editor: area tujuan berwarna hijau transparan | Area tujuan tidak terlihat |
| Panel (`Cmd+J`) | Judul tab panel yang aktif terang dengan garis bawah `accent`; yang lain redup | Tab panel aktif tidak jelas |
| Status Bar | Latar `bar`, teks redup, hover menerangkan item; item remote (pojok kiri) hijau dengan teks gelap | Teks status bar sulit dibaca |
| Title Bar, Menu Bar, Command Center | Aktif: teks terang. Pindah ke aplikasi lain: teks meredup tetapi masih terbaca | Teks tidak berubah saat jendela tidak aktif, atau hilang |
| Breadcrumbs | Teks redup; `Cmd+Shift+.` lalu panah: item terfokus terang | Item terfokus tidak terlihat |
| Scrollbar | Slider samar saat diam, lebih terang saat hover dan saat ditarik | Slider tidak terlihat saat hover |
| Sash | Arahkan kursor ke batas sidebar: garis `accent` muncul | – |
| Notifikasi | `Cmd+Shift+P` → **Notifications: Show Notifications**; picu satu toast (mis. simpan file read-only atau jalankan perintah yang gagal) | Toast menyatu dengan editor di belakangnya |

**Kriteria yang ditutup:** hover, focus dan active bisa dibedakan; pemisahan sidebar dari editor jelas; tab aktif berbeda jelas.

## T2. File Explorer

**Buka:** Explorer pada folder `samples/`. Untuk dekorasi Git, lihat T9.

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| Hover, selected, focused | Hover: latar sedikit lebih terang. Klik satu file: latar hijau gelap, teks terang, outline `accent`. Klik ke editor: latar item memudar (selected, tidak fokus) | Tiga state itu tampak sama |
| Navigasi keyboard | Tekan panah atas/bawah di Explorer: outline `accent` mengikuti | Fokus tidak terlihat |
| Folder | Buka-tutup `git-states/`: panah dan nama terbaca; indentation guide `line` muncul, yang aktif lebih terang | Guide terlalu mencolok atau tidak terlihat |
| File aktif | File yang sedang terbuka di editor ditandai sebagai terpilih di Explorer | – |
| Filter | Fokus ke Explorer lalu `Cmd+Alt+F` dan ketik `sample`: huruf yang cocok berwarna `accent` | Huruf cocok tidak menonjol |
| Error dan warning | `sample.ts` punya error TypeScript (modul tidak ditemukan): nama file `coral` dengan angka badge | Hanya warna, tanpa angka |
| Drag and drop | Seret satu file ke folder: folder tujuan berlatar hijau transparan | – |
| Context menu | Klik kanan: latar `surface`, border, item terpilih hijau gelap, garis pemisah terlihat. Di macOS, menu konteks memakai menu native sistem kecuali `window.menuStyle` diatur ke `custom` | Menu custom tidak punya border |
| Inline actions | Hover judul bagian Explorer: ikon aksi muncul; hover ikon menerangkan latarnya | – |

## T3. Editor

**Buka:** `samples/sample.ts`.

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| Baris aktif, nomor baris, kursor | Baris aktif sedikit lebih terang tanpa border; nomor baris redup, nomor baris aktif terang; kursor `accent` | Nomor baris tak terbaca; kursor hilang di atas seleksi |
| Seleksi | Blok beberapa baris termasuk komentar: semua warna syntax tetap terbaca, komentar masih terbaca | Komentar tenggelam |
| Sorotan kata | Taruh kursor di `Repository`: kemunculan lain mendapat latar hijau tipis berborder; lokasi tulis (deklarasi) berborder lebih tegas | Sorotan tidak bisa dibedakan dari seleksi |
| Bracket | Taruh kursor di samping `{`: pasangannya berlatar hijau tipis dengan border `accent`. Kurung bersarang berwarna berurutan: amber, violet, cyan, hijau, oranye, teal | Dua tingkat berdekatan tampak sama |
| Kurung tak berpasangan | Hapus satu `)`: kurung yatim menjadi `coral` | – |
| Indentation guide, whitespace | Guide `line`, yang aktif lebih terang. `View > Appearance > Render Whitespace`: titik-titik redup | Guide mengganggu teks |
| Minimap, overview ruler | Minimap tidak lebih terang dari kode; penanda error `coral`, warning `amber`, hasil pencarian `amber` di tepi kanan | Minimap atau ruler mendominasi |
| Ruler | Tambahkan `"editor.rulers": [80, 120]`: dua garis tipis `line` | – |
| Folding | Lipat satu fungsi: baris terlipat berlatar sedikit lebih terang; panah lipat terlihat saat hover gutter | – |
| Sticky scroll | Gulir di dalam class panjang: baris lengket berlatar editor dengan garis bawah dan bayangan | Baris lengket menyatu dengan kode |
| Squiggle | Error merah-koral, warning `amber`. Variabel tak terpakai (`nothing`, `#secret`) tampak dipudarkan | Kode pudar tak terbaca |
| Inlay hints, CodeLens | Nyalakan `editor.inlayHints.enabled`: hint redup di atas latar tipis. CodeLens (mis. "1 reference") redup | Hint terlihat seperti kode asli |
| Find widget | `Cmd+F`, lihat T8 | – |
| Peek | Klik kanan `Entity` → **Peek > Peek References**: border `accent`, judul terang, daftar di kanan dengan item terpilih hijau gelap, match `amber` | Peek menyatu dengan editor |
| Tautan | `Cmd`+hover pada sebuah import: teks menjadi `cyan` bergaris bawah | – |
| Linked editing | Di `sample.html`, nyalakan `editor.linkedEditing` lalu taruh kursor di nama tag: pasangan tag berlatar `violet` tipis | – |
| Snippet | Di file `.ts`, ketik `for` lalu pilih snippet: tabstop berlatar `cyan` tipis | – |
| Diff editor | Lihat T9 | – |
| Merge editor | Lihat T9 | – |

## T4. Syntax highlighting

**Buka:** tiap file di `samples/`, satu per satu. Matikan semantic highlighting dulu (`"editor.semanticHighlighting.enabled": false`) supaya yang terlihat murni TextMate; nyalakan lagi untuk T5.

Yang harus terlihat di semua bahasa:

| Kategori | Warna dan gaya |
| --- | --- |
| Komentar | abu-kehijauan redup, italic; tag dokumentasi (`@param`) `violet` |
| Keyword, `import`/`export` | `violet`; `this`/`self`/`super` `violet` italic |
| Fungsi dan method | `cyan`; bawaan (`console.log`, `print`, `len`) italic |
| Class, interface, type, enum | `amber`; tipe bawaan (`string`, `int`) italic |
| String | hijau `accent`; escape (`\n`) dan regex `teal`; `${` `}` `violet` |
| Angka, boolean, `null`, konstanta, enum member | `orange` |
| Properti | `mint` |
| Parameter | putih terang, italic |
| Operator | abu sedang; tanda baca lebih redup |
| Decorator / annotation | `amber` italic |

Per file:

| File | Periksa khusus |
| --- | --- |
| `sample.ts` | namespace `Units` `teal`; `@sealed`/`@logged` `amber` italic; regex `SKU_PATTERN` `teal`; generics `<T extends Entity>` `amber` |
| `sample.js` | JSDoc: `@param` `violet`, `{string}` `amber`, nama parameter teks biasa; field privat `#tasks` |
| `sample.tsx`, `sample.jsx` | tag HTML (`section`, `li`) `coral`; komponen (`Badge`, `TodoItem`) `amber`; atribut `amber` italic; kurung `{}` ekspresi `violet` |
| `sample.html` | CSS di dalam `<style>` dan JavaScript di dalam `<script>` berwarna sama seperti di file `.css` dan `.js` |
| `sample.css`, `sample.scss` | selector class `amber`, id `cyan`, pseudo `violet`, elemen `coral`; nama properti `mint`; nilai dan satuan `orange`; `@media`, `@mixin` `violet` |
| `sample.json`, `sample.jsonc` | kunci `mint`, string `accent`, angka/boolean/null `orange`; komentar di JSONC italic |
| `sample.md`, `sample.mdx` | heading hijau tebal; **bold** dan *italic* terang; tautan `cyan` bergaris bawah; kode `amber`; kutipan redup italic; penanda list `violet`; di MDX komponen `amber` |
| `sample.py` | decorator `amber` italic; `self`/`cls` `violet` italic; docstring redup italic; f-string: kurung `{}` `violet` |
| `Sample.java` | annotation `amber` italic; Javadoc; `package`/`import` path `teal`; enum constant `orange` |
| `sample.go` | tipe bawaan (`string`, `float64`) `amber` italic; struct tag (raw string) `accent`; nama package `teal` |
| `sample.rs` | macro (`println!`, `product!`) `cyan` tebal; lifetime `'a` `violet` italic; atribut `#[derive]` `amber` italic |
| `sample.php` | variabel `$x` teks biasa termasuk tanda `$`; atribut `#[Cached]`; PHPDoc; heredoc |
| `sample.sql` | keyword `violet`; tipe data `amber` italic; fungsi (`SUM`, `COALESCE`) `cyan` italic |
| `sample.yaml` | kunci `mint`; anchor `&defaults` dan alias `*defaults` `amber`; boolean dan angka `orange` |
| `sample.xml` | tag `coral`; prefix namespace `inv:` `teal`; atribut `amber` italic; entity (`&amp;`) `teal`; CDATA |
| `sample.sh` | perintah bawaan (`echo`, `printf`) `cyan` italic; variabel teks biasa; heredoc |
| `Dockerfile` | instruksi (`FROM`, `RUN`) `violet`; string `accent` |

**Tanda gagal:** dua kategori berdekatan sulit dibedakan (terutama properti `mint` terhadap teks biasa, dan `orange` terhadap `amber`); teks polos putih di tempat yang seharusnya berwarna; bahasa tertanam di HTML berwarna beda dari file aslinya. Kalau ada token yang salah warna, pakai langkah T0.5 dan catat scope TextMate-nya; scope itulah yang perlu ditambahkan ke `tokenRules`.

## T5. Semantic highlighting

**Buka:** `sample.ts` (language server TypeScript sudah bawaan). Untuk bahasa lain perlu extension: Pylance (`sample.py`), rust-analyzer (`sample.rs`), Go (`sample.go`), Language Support for Java (`Sample.java`). Nyalakan lagi semantic highlighting.

| Periksa di `sample.ts` | Harus terlihat (Inspect Tokens menampilkan `semantic token type`) |
| --- | --- |
| `Repository`, `Entity`, `Status`, `Id` | `class` / `interface` / `enum` / `type` → `amber` |
| `T` pada `Repository<T>` | `typeParameter` → `amber` |
| `save`, `find`, `main` | `method` / `function` → `cyan` |
| `items`, `name`, `tags` | `property` → `mint` |
| `item`, `options`, `predicate` | `parameter` → terang, italic |
| `Units` | `namespace` → `teal` |
| `Status.Draft` | `enumMember` → `orange` |
| `MAX_ITEMS`, `draft`, `result` (deklarasi `const`) | `variable.readonly` → `orange` |
| `counter` (deklarasi `let`) | `variable` → teks biasa |
| `Repository.instances` | modifier `static` → tebal |
| `save` (method `async`) | modifier `async` → italic |
| `repo.get(...)` di akhir file | modifier `deprecated` → dicoret |
| `console`, `Map`, `Promise`, `Object` | modifier `defaultLibrary` → italic |

Lalu matikan dan nyalakan semantic highlighting bergantian pada file yang sama.

**Tanda gagal:** warna satu token berubah menjadi warna kategori lain saat semantic dinyalakan (selain `const` lokal yang berubah dari teks biasa ke `orange`, dan itu disengaja); modifier tidak memberi gaya huruf; file tampak polos saat semantic dimatikan.

Catatan: `*.declaration` sengaja tidak diberi gaya. `*.modification` (garis bawah) hanya dikirim oleh sebagian language server, mis. rust-analyzer untuk variabel `mut`.

## T6. Terminal

**Buka:** terminal terintegrasi (`` Ctrl+` ``), jalankan `bash ansi.sh` (folder kerja sudah `samples/`).

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| 16 warna teks | Tiap baris normal dan bright bisa dibedakan; Blue jelas lebih biru daripada Cyan; Black normal nyaris tak terlihat sebagai teks (disengaja), Bright Black terbaca | Normal dan bright tampak sama; Blue dan Cyan tertukar |
| 16 warna latar | Teks bawaan di atas latar gelap terbaca; baris "Black text on each background" terbaca | – |
| Log dan `git status` | INFO hijau, DEBUG biru, WARN amber, ERROR koral, FATAL putih di atas koral | Level log tidak bisa dibedakan |
| Kursor dan seleksi | Kursor `accent`; blok teks: seleksi hijau transparan, teks tetap terbaca | Kursor hilang |
| Dekorasi perintah | Jalankan `true` lalu `false`: titik di kiri prompt hijau untuk sukses, koral untuk gagal (butuh shell integration) | – |
| Pencarian di terminal | `Cmd+F` di terminal, cari `Bright`: match `amber`, match aktif berborder | – |
| Alat nyata | Jalankan `ls -la`, `git log --oneline --graph` di repo mana pun, `npm run check` di folder proyek | Output sulit dibaca |

Catatan: VS Code menyesuaikan warna teks terminal secara otomatis kalau `terminal.integrated.minimumContrastRatio` > 1 (bawaan 4,5). Untuk melihat warna tema apa adanya, atur sementara ke `1`.

## T7. Panel dan output

| Panel | Cara membuka | Harus terlihat |
| --- | --- | --- |
| Problems | `Cmd+Shift+M` dengan `sample.ts` terbuka | Ikon error `coral`, warning `amber`, info `cyan`; bentuk ikon berbeda untuk tiap tingkat |
| Output | `Cmd+Shift+U`, pilih kanal mana pun (mis. "Extension Host" atau "Git") | Teks terbaca; kanal log mewarnai `info`/`warning`/`error` |
| Debug Console | Lihat T10 | `console.warn` `amber`, `console.error` `coral`, tautan sumber di kanan redup |
| Terminal | T6 | – |
| Ports | **View: Toggle Ports**; teruskan port mana pun | Tabel terbaca, baris terpilih hijau gelap |
| Test Results | Butuh extension penyedia tes; kalau ada, jalankan satu tes yang lulus dan satu yang gagal | Ikon lulus hijau, gagal koral, dilewati abu |

**Tanda gagal:** latar panel berbeda-beda antar tab; tab panel aktif tidak jelas.

## T8. Search & Replace

**Buka:** `sample.ts`, lalu `Cmd+F` dan cari `item`. Lalu `Cmd+Shift+F` dan cari `status` di seluruh folder.

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| Input | Latar lebih gelap dari widget, border terlihat, placeholder redup tetapi terbaca; saat fokus border `accent` | Batas input tidak terlihat |
| Match di editor | Semua match berlatar `amber` tipis dengan border samar; match aktif lebih kuat dengan border `amber` penuh; syntax di bawahnya tetap terbaca | Match aktif sama dengan yang lain |
| Opsi | Klik `Aa`, `ab`, `.*`: tombol aktif berlatar hijau transparan dengan border `accent` | Opsi aktif tidak jelas |
| Validasi | Nyalakan `.*` lalu ketik `(`: kotak pesan dengan border `coral` dan teks terbaca | Pesan error tidak terbaca |
| Replace | Buka baris replace (`Cmd+Alt+F`): tombol replace terlihat, nonaktif saat tak ada match | – |
| Hasil di sidebar | Teks cocok disorot `amber`; baris terpilih hijau gelap; badge jumlah hijau | – |
| Riwayat | Di input pencarian tekan panah atas: isi berganti ke pencarian sebelumnya | – |
| Find in selection | Blok beberapa baris, `Cmd+F`, nyalakan "Find in Selection": area berlatar `cyan` sangat tipis | – |
| Overview ruler, minimap | Penanda `amber` di posisi match | – |

## T9. Source Control

**Siapkan:** di terminal, `bash git-states/setup.sh`, lalu di Extension Development Host **File > Open Folder** → `samples/git-states/repo`. (Folder itu harus dibuka sebagai akar workspace supaya Git terdeteksi.) Untuk mengulang, hapus folder `repo` lalu jalankan skrip lagi.

| File | Status | Warna dan huruf di Explorer serta Source Control |
| --- | --- | --- |
| `modified.ts`, `staged-modified.ts` | modified | `amber`, `M` |
| `added.ts` | added | hijau, `A` |
| `untracked.ts` | untracked | hijau, `U` |
| `deleted.ts`, `staged-deleted.ts` | deleted | `coral`, `D`, nama dicoret di Source Control |
| `renamed.ts` | renamed | `cyan`, `R` |
| `conflict.ts` | konflik | `violet`, `!` |
| `ignored.log`, `build/` | ignored | sangat redup |

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| Konsistensi | Warna tiap status sama di Explorer, Source Control, dan tab editor | Warna berbeda antar tampilan |
| Gutter | Buka `modified.ts`: garis `amber` pada baris berubah, hijau pada baris baru, segitiga `coral` pada baris terhapus; penanda yang sama di minimap dan overview ruler | – |
| Diff | Klik `modified.ts` di Source Control: baris ditambah berlatar hijau tipis, dihapus koral tipis; kata yang berubah sedikit lebih kuat; syntax tetap terbaca | Latar diff menenggelamkan komentar |
| Inline diff | Di diff editor, menu `...` → matikan "Side by Side" | Baris lama dan baru bisa dibedakan |
| Konflik | Buka `conflict.ts`: blok *Current* hijau, *Incoming* `cyan`, dengan header lebih kuat. Klik **Resolve in Merge Editor** | Current dan Incoming tertukar atau sama |
| Grafik riwayat | Bagian "Graph" di Source Control: garis cabang berwarna palet, label ref terbaca | – |
| Submodule (opsional) | Di `repo`, `git -c protocol.file.allow=always submodule add <path repo lain>`: entri berwarna `teal`, `S` | – |

Catatan: diff editor VS Code tidak punya warna "baris diubah"; perubahan tampil sebagai pasangan baris dihapus dan ditambah.

## T10. Debugging

**Buka:** kembali ke folder `samples/`, buka `debug-demo.js`.

1. Klik gutter di baris `const tax = ...` → breakpoint (titik `coral`).
2. Klik kanan gutter di baris `const price = priceWithTax(item)` → **Add Conditional Breakpoint** → `item.price > 100`.
3. Klik kanan gutter di baris `lines.push(...)` → **Add Logpoint** → `price is {price}`.
4. Tambah satu breakpoint lagi di mana saja, lalu nonaktifkan lewat klik kanan → **Disable Breakpoint**.
5. `F5` → **Node.js**. Di panel Breakpoints, centang "Caught Exceptions".

| Periksa | Harus terlihat | Tanda gagal |
| --- | --- | --- |
| Jenis breakpoint | Biasa: lingkaran; kondisional: lingkaran dengan tanda sama-dengan; logpoint: wajik; nonaktif: abu. Biasa, kondisional dan logpoint **sama-sama `coral`** (VS Code tidak menyediakan warna terpisah), jadi pembedanya bentuk | Bentuk tidak bisa dibedakan pada ukuran gutter |
| Baris eksekusi | Latar `amber` transparan, panah `amber` di gutter; kode di baris itu tetap terbaca | Baris eksekusi tertukar dengan hasil pencarian |
| Status Bar | Berubah menjadi `amber` dengan teks gelap selama sesi debug | Tidak berubah |
| Debug toolbar | Ikon lanjut hijau, langkah `cyan`, stop `coral`; latar `surface` dengan border | Toolbar menyatu dengan tab |
| Variables, Watch | Nama `mint`, string hijau, angka dan boolean `orange`; nilai yang baru berubah berkedip `amber`. Tambahkan `item.price * 2` ke Watch | Nama dan nilai sewarna |
| Call Stack | Frame aktif disorot; label status ("Paused on breakpoint") terbaca | – |
| Nilai inline | Nyalakan `debug.inlineValues`: nilai redup di atas latar tipis di ujung baris | Nilai terlihat seperti kode |
| Debug Console | Output `info`, `warn` (`amber`), `error` (`coral`); ketik `summary.total` di prompt | – |
| Exception widget | Lanjutkan sampai `JSON.parse` melempar: kotak dengan border `coral` | – |

## T11. IntelliSense dan widget bahasa

**Buka:** `sample.ts`.

| Periksa | Cara | Harus terlihat |
| --- | --- | --- |
| Suggest | Di baris baru dalam `main`, ketik `repo.` | Daftar berlatar `surface` dengan border dan bayangan; item terpilih hijau gelap dengan teks terang; huruf yang cocok `accent`; ikon simbol berwarna sesuai kategori (method `cyan`, properti `mint`, class `amber`) |
| Detail | `Ctrl+Space` sekali lagi | Panel dokumentasi di samping, terbaca, terpisah dari daftar |
| Parameter hints | Ketik `repo.save(` | Parameter aktif ditebalkan atau disorot |
| Hover | Arahkan kursor ke `Repository` | Kotak `surface` berborder; kode di dalamnya ber-syntax highlight |
| Quick Fix | Taruh kursor di baris yang error, `Cmd+.` | Lampu `amber` di gutter; daftar aksi dengan item terfokus hijau gelap |

**Tanda gagal:** widget tidak punya batas yang jelas terhadap kode; item terpilih sulit ditemukan; sorotan huruf cocok lebih mencolok daripada item terpilih.

## T12. Dialog, menu, notifikasi

| Periksa | Cara | Harus terlihat |
| --- | --- | --- |
| Command Palette, Quick Open | `Cmd+Shift+P`, `Cmd+P` | Latar `surface`, bayangan, item terfokus hijau gelap, huruf cocok `accent`, label keybinding di kanan terbaca, judul grup hijau |
| Quick Input bertahap | **Git: Checkout to...** atau **Preferences: Configure Language Specific Settings** | Judul, input, pesan validasi terbaca |
| Dropdown | Settings → setelan dengan pilihan (mis. "Auto Save") | Daftar berborder; pilihan aktif disorot |
| Dialog modal | Tutup file yang belum disimpan. Di macOS dialog ini native kecuali `window.dialogStyle` = `custom` | Tombol utama hijau dengan teks gelap; tombol sekunder gelap berborder |
| Konfirmasi destruktif | Hapus satu file contoh salinan lewat Explorer | Tombol aksi jelas; teks peringatan terbaca |
| Toast, Notification Center | Klik ikon lonceng di Status Bar | Toast berborder, terpisah dari latar; ikon error/warning/info berbeda bentuk dan warna |
| Progress | **Developer: Reload Window**, atau instal extension apa pun | Garis progres `accent` |

## T13. Widget dan UI khusus

| Periksa | Cara | Harus terlihat |
| --- | --- | --- |
| Breadcrumb picker | Klik satu segmen breadcrumb | Tree berlatar `surface` |
| Color picker | Di `sample.css`, hover kotak warna di samping nilai hex | Picker terbaca; mengikuti warna hover widget (tidak ada Color ID khusus) |
| Tree, list, table | Explorer, hasil Search, **Preferences: Open Keyboard Shortcuts** | Selection dan focus sama dengan T2; baris tabel berselang tipis |
| Settings | `Cmd+,`; cari `font` | Setelan yang diubah bergaris `amber` di kiri; baris terfokus punya batas; input dan checkbox berborder |
| Extensions | `Cmd+Shift+X`; buka detail satu extension | Tombol Install hijau teks gelap; bintang `amber`; tab detail terbaca |
| Welcome | **Help: Welcome** | Kartu `surface` berborder, hover menerangkan |
| Chat | Buka tampilan Chat kalau tersedia | Gelembung permintaan, input, blok kode terbaca |
| Notebook | Buat file `uji.ipynb` (butuh extension Jupyter untuk menjalankan sel) | Sel terfokus berborder `accent`; latar sel `surface` |
| Testing | Butuh extension penyedia tes | Ikon lulus hijau, gagal `coral`, antre `amber`, dilewati abu |
| Timeline | Bagian Timeline di Explorer dengan satu file terbuka | Daftar terbaca |
| Webview dan UI extension | Buka pratinjau Markdown (`Cmd+Shift+V`) pada `sample.md`, dan UI satu extension yang biasa dipakai | Pratinjau mengikuti latar dan warna tautan tema. UI extension boleh menyimpang: catat, jangan dianggap gagal |

Tidak ada date picker bawaan di VS Code, jadi item itu tidak bisa diuji.

## T14. Aksesibilitas dan state visual

1. **Kontras:** `npm run check` sudah memeriksa angka. Dengan mata, baca komentar, nomor baris, teks Status Bar dan placeholder pada ukuran huruf normal dari jarak kerja biasa.
2. **Navigasi keyboard:** tanpa mouse, tekan `Cmd+0` (Side Bar), `Cmd+1` (editor), `Cmd+J` (panel), lalu `Tab` berulang di Settings dan di Find widget. Di setiap perhentian harus ada outline `accent` yang jelas.
3. **State:** pada satu list (Explorer), bandingkan berdampingan: hover, selected-fokus, selected-tidak-fokus, dan item nonaktif (mis. perintah menu yang tidak tersedia). Keempatnya harus berbeda.
4. **Bukan hanya warna:** error dan warning di Problems punya ikon berbeda; status Git punya huruf; tab aktif punya garis; deprecated dicoret.
5. **Simulasi buta warna (opsional):** di macOS, System Settings → Accessibility → Display → Color Filters. Periksa bahwa added/deleted dan error/warning tetap bisa dibedakan lewat huruf dan ikon.
6. **High Contrast:** ganti tema ke "Dark High Contrast" lalu kembali. Tema HC bawaan harus tampil normal, dan NubiBuilds Dark kembali utuh. Tema ini tidak punya varian HC.

## T15. Gerbang akhir

1. Ambil screenshot untuk: editor dengan `sample.ts`, Explorer + Source Control (T9), terminal dengan `ansi.sh`, sesi debug, Command Palette, diff editor. Simpan di folder `images/` dan rujuk dari `README.md`.
2. Kemas: `npm run package` → `nubibuilds-dark-0.1.0.vsix`.
3. Kalau ingin memasang ke VS Code utama: `code --install-extension nubibuilds-dark-0.1.0.vsix`. Untuk mencopot: `code --uninstall-extension danaharliansyah.nubibuilds-dark`.
4. Sebelum dipublikasikan: dorong `main` ke GitHub (gambar di `README.md` dirujuk lewat URL repo, jadi baru tampil setelah ada di sana dan repo-nya publik), lalu terbitkan dengan `npx @vscode/vsce login danaharliansyah` dan `npx @vscode/vsce publish`. ID `publisher` di `package.json` adalah `danaharliansyah`. Galeri di `images/README.md` boleh dipindahkan ke `README.md`.
