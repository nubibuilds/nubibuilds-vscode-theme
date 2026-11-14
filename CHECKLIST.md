# Checklist NubiBuilds Dark

Status per 14 November 2026, versi 0.1.0.

**Tanda:** `[x]` diimplementasikan, lulus pemeriksaan otomatis, dan (untuk hal yang hanya bisa dinilai dengan mata) lulus uji manual · `[~]` hanya didukung sebagian, atau masih ada keputusan terbuka · `[ ]` belum.

**Dua sumber `[x]`.** Pemeriksaan otomatis (`npm run check`) membuktikan empat hal: Color ID-nya ada di tema dan terdaftar di referensi resmi; warna dan gaya huruf tiap kategori syntax serta semantic sama dengan tabel spesifikasi; pasangan warna yang terdaftar memenuhi rasio kontras; dan semua nilai berasal dari palet. Hal yang hanya bisa dinilai dengan mata ditandai `[x]` berdasarkan **uji manual pemilik proyek pada 14 November 2026**: semua langkah T0–T14 di `TESTING.md` dijalankan di Extension Development Host untuk ketiga tema, dan dilaporkan tanpa temuan. Uji manual itu tidak dilakukan oleh Claude; yang dicatat di sini adalah laporan hasilnya.

**Yang masih terbuka:** screenshot dokumentasi di luar sampul (T15); 64 Color ID milik UI baru yang dibiarkan default; `main` belum didorong ke GitHub; publisher belum dipastikan terdaftar di Marketplace, dan `package.json` masih `"private": true`. Lima item tetap `[~]` karena VS Code tidak menyediakan Color ID-nya atau memang tidak ada variannya: conditional breakpoint, logpoint, baris diff "diubah", date picker, dan High Contrast.

## Tiga tema

Spesifikasi awal meminta satu varian. Atas keputusan pemilik proyek, extension sekarang berisi tiga tema gelap dari palet yang sama. Checklist di bawah ditulis untuk **NubiBuilds Dark**; dua tema lain memakai Color ID, aturan token dan warna teks yang sama, dan hanya berbeda pada hal berikut.

| Tema | Bedanya dari NubiBuilds Dark |
| --- | --- |
| **NubiBuilds Dark** | Persis spesifikasi: editor `bg`; sidebar, panel, terminal `surface`; activity bar, title bar, status bar, deretan tab `bar`. File temanya identik dengan tag Git `baseline-spec` |
| **NubiBuilds Dark Void** | Sidebar, panel, terminal, activity bar, title bar, status bar, deretan tab dan tab tidak aktif semuanya `bg`. Widget melayang tetap `surface`. Tab aktif dan tidak aktif berlatar sama; pembedanya garis atas `accent` dan teks yang lebih terang |
| **NubiBuilds Dark Float** | Editor, gutter, breadcrumb, tab aktif dan minimap memakai `surface`; baris aktif naik ke `hover`. Semua sorotan dilemahkan (tabel di bawah) |

Alpha sorotan di Float, diturunkan supaya komentar di atas sorotan pada baris aktif tetap ≥ 4,5:1:

| Sorotan | Dark dan Void | Float |
| --- | --- | --- |
| Seleksi editor dan terminal | 15% | 11,5% |
| Sorotan kata | 12% | 11% |
| Match pencarian aktif / lainnya | 17% / 10% | 13% / 8% |
| Bracket matching | 14% | 11% |
| Linked editing | 16% | 14% |
| Snippet tabstop | 14% | 12% |
| Baris diff + kata | 9% + 6% | 7% + 5% |
| Baris eksekusi debug | 16% | 13% |
| Stack frame terfokus, konflik merge | 12% | 11% |
| Merge editor: perubahan + kata | 10% + 8% | 8% + 6% |
| Merge editor: perubahan base + kata | 10% + 8% | 9% + 7% |
| Merge editor: input 1 / input 2 | 14% / 14% | 11% / 12% |
| Rentang komentar aktif | 14% | 11% |

Seleksi direncanakan 12%, tetapi setelah dibulatkan ke byte hex hasilnya 4,49:1, jadi dipakai 11,5%.

`npm run check` menjalankan kedua pemeriksaan untuk ketiga tema dan gagal kalau salah satunya gagal. Hasil saat ini: ketiganya lulus, 0 kegagalan. Pasangan teks terendah di Float: `dim` di atas sorotan simbol pada baris aktif, 4,51:1.

Ketiga tema sudah diuji manual dengan seluruh langkah `TESTING.md` (T0–T14) dan dilaporkan tanpa temuan.

## Ringkasan pemeriksaan otomatis (NubiBuilds Dark)

| Ukuran | Hasil |
| --- | --- |
| `npm run check` | lulus, 0 kegagalan |
| Color ID ditetapkan | 837 |
| Aturan token TextMate | 54 aturan, 239 selector scope |
| Aturan semantic token | 46 |
| Pemeriksaan kontras | 1.277 pasangan |
| Pasangan teks terendah (kelas 4,5:1) | ANSI bright black (`muted`) di atas `selectionListInactive`: 4,54:1 |
| Syntax terendah di atas lapisan transparan | `dim` di atas seleksi pada baris aktif: 4,56:1 |
| Komponen non-teks terendah (kelas 3:1) | border tombol sekunder terhadap latarnya: 3,16:1 |
| Jarak kategori syntax terendah | tipe (`amber`) vs angka (`orange`): ΔE 21,2 (minimum 12) |

### Verifikasi Color ID

Halaman Theme Color Reference berhasil dibuka pada 14 November 2026. 971 ID disalin ke `scripts/official-color-ids.json`, dan `check-coverage.mjs` menolak ID yang tidak ada di sana. **Tidak ada ID yang ditulis dari ingatan; tidak ada yang berstatus "belum diverifikasi".**

Yang tidak diverifikasi adalah perilaku tiap ID di VS Code yang terpasang (1.146.0). Beberapa ID di halaman itu mungkin lebih baru daripada versi tersebut; VS Code mengabaikan ID yang tidak dikenalnya.

### Perubahan dari palet bagian 3

| Yang diubah | Dari | Menjadi | Alasan |
| --- | --- | --- | --- |
| `muted` | `#6f8375` | `#768b7c` | Di atas `hover` (inlay hints, nilai inline) hanya 4,25:1. Sekarang 4,73:1 di `hover` dan 4,54:1 di `selectionListInactive`. ANSI bright black ikut berubah karena memakai warna yang sama |
| `borderStrong` | `#4a6a56` | `#4f715c` | Border tombol sekunder di atas latar `hover` hanya 2,86:1. Sekarang 3,16:1 |
| Seleksi editor | ~18% | 15% | Pada 18%, komentar di atas seleksi pada baris aktif (`surface`) turun di bawah 4,5:1 |
| Match pencarian (lainnya) | ~20% | 10% | Diturunkan supaya tetap berjarak dari match aktif, yang harus turun (baris berikut) |
| Match pencarian (aktif) | ~32% | 17% + border `amber` penuh | Pada 32%, `dim` hanya sekitar 3,3:1. Pembeda dari match lain sekarang terutama border penuh, bukan alpha. Ini penyimpangan terbesar dari nilai awal; diterima pada uji manual (T8) |
| Baris diff ditambah / dihapus | ~14% | 9% baris + 6% kata | Sorotan kata menumpuk di atas sorotan baris. Gabungan keduanya yang harus lolos 4,5:1 |
| Baris eksekusi debug | ~18% | 16% | 18% memberi 4,44:1 untuk `dim` pada baris aktif |
| Seleksi tidak aktif, sorotan kata | 10%, 12% | tidak berubah | – |

Warna dasar tidak diubah.

### Warna baru di luar palet

- `shadow` `#000000`, selalu dengan alpha (40% atau 50%). Bayangan widget harus lebih gelap dari `bg`, dan `bg` adalah warna tergelap di palet, jadi tidak ada warna palet yang bisa dipakai.

### Color ID yang sengaja dibiarkan default (134)

| Kelompok | Jumlah | Alasan |
| --- | --- | --- |
| `agents*`, `agent*`, `modern*`, `surface.*`, `activeSessionView.*`, `inactiveSessionView.*` | 64 | Bagian UI baru yang tidak tercakup checklist. Saya tidak bisa memastikan komponen mana yang memakainya tanpa melihatnya, jadi tidak saya tebak |
| `editorIndentGuide.background2`–`6`, `activeBackground2`–`6`, dan dua ID lama tanpa angka | 12 | Hanya tingkat 1 yang dipakai; tingkat lain bawaan transparan. ID tanpa angka sudah usang |
| `testing.icon*.retired` | 6 | VS Code menurunkannya sendiri dari ikon tes yang sudah ditetapkan |
| `contrastBorder`, `contrastActiveBorder` | 2 | Khusus High Contrast; menetapkannya di tema biasa menggambar border di semua komponen |
| `editor.selectionForeground`, `editor.findMatchForeground`, `editor.findMatchHighlightForeground`, `terminal.selectionForeground`, `editorBracketMatch.foreground` | 5 | Kalau ditetapkan, warna syntax di bawah sorotan hilang |
| Border dan latar opsional (`editorError.background`, `editorWarning.border`, `tab.hoverBorder`, `menu.selectionBorder`, `diffEditor.insertedTextBorder`, dan sejenisnya) | 45 | Bawaannya "tidak digambar", dan itu yang diinginkan |

Daftar lengkapnya dicetak oleh `npm run check:coverage`.

---

## 1. Workbench UI

- [x] Activity Bar: `activityBar.background`, `.foreground`, `.inactiveForeground`, `.activeBorder`, `.activeBackground`, `.border`, `activityBarBadge.*`, `activityBarTop.*`, `activityErrorBadge.*`, `activityWarningBadge.*`
- [x] Primary Sidebar: `sideBar.background`, `.foreground`, `.border`, `.dropBackground`
- [x] Secondary Sidebar: tidak punya Color ID sendiri; memakai `sideBar.*`
- [x] Sidebar Title: `sideBarTitle.foreground`, `.background`, `.border`
- [x] Section header: `sideBarSectionHeader.background`, `.foreground`, `.border`
- [x] Panel dan Panel Tabs: `panel.background`, `.border`, `panelTitle.activeForeground`, `.activeBorder`, `.inactiveForeground`, `.border`, `panelTitleBadge.*`, `panelSection*`
- [x] Status Bar: `statusBar.*` (normal, debugging, noFolder), `statusBarItem.*` (hover, active, remote, error, warning, prominent, offline)
- [x] Title Bar dan Menu Bar: `titleBar.*`, `menubar.selectionBackground`, `.selectionForeground`
- [x] Command Center: `commandCenter.*`
- [x] Breadcrumbs: `breadcrumb.foreground`, `.background`, `.focusForeground`, `.activeSelectionForeground`
- [x] Notifications dan Notification Center: `notifications.*`, `notificationToast.border`, `notificationCenter.border`, `notificationCenterHeader.*`, `notificationLink.foreground`, `notifications{Error,Warning,Info}Icon.foreground`
- [x] **(tambahan)** Editor Groups dan Tabs: `editorGroup.*`, `editorGroupHeader.*`, `tab.*` (aktif, tidak aktif, hover, unfocused, modified, `lastPinnedBorder`, `dragAndDropBorder`, selected), `sideBySideEditor.*`
- [x] **(tambahan)** Scrollbar: `scrollbar.shadow`, `scrollbarSlider.background`, `.hoverBackground`, `.activeBackground`
- [x] **(tambahan)** Kontrol dasar: `focusBorder`, `foreground`, `disabledForeground`, `descriptionForeground`, `errorForeground`, `icon.foreground`, `selection.background`, `widget.shadow`, `widget.border`, `sash.hoverBorder`
- [x] **(tambahan)** Tombol, checkbox, radio, toggle, badge, progress bar: `button.*`, `checkbox.*`, `radio.*`, `inputOption.*`, `actionBar.toggledBackground`, `badge.*`, `progressBar.background`
- [x] **(tambahan)** Tautan dan teks: `textLink.*`, `textCodeBlock.background`, `textBlockQuote.*`, `textPreformat.*`, `textSeparator.foreground`
- [x] **(tambahan)** Label keybinding: `keybindingLabel.*`

Kriteria:

- [x] Kontras latar dan teks memadai (semua pasangan teks workbench ≥ 4,5:1)
- [x] Indikator aktif jelas → T1 (kontras garis indikator ≥ 3:1 sudah lulus)
- [x] Ikon dan badge terbaca → T1 (teks badge 13,3:1 sudah lulus)
- [x] Hover, focus dan active bisa dibedakan → T1
- [x] Header dan border konsisten → T1
- [x] Pemisahan sidebar dari editor jelas → T1. Catatan: `line` terhadap `bg` hanya 1,4:1 dan `surface` terhadap `bg` hampir sama; ini sesuai spesifikasi ("pemisah dekoratif"), dan diterima pada uji manual
- [x] Tab aktif berbeda jelas dari yang tidak aktif → T1
- [x] Status debugging berbeda dari normal → T10 (latar `amber`, sudah lulus kontras)
- [x] Error, warning dan informasi tidak hanya dibedakan lewat warna → T7, T14 (ikon dan squiggle milik VS Code; tema tidak bisa menjaminnya)

## 2. File Explorer

- [x] Latar dan teks Explorer: `sideBar.background`, `sideBar.foreground`
- [x] Root workspace/folder: `sideBarSectionHeader.*`
- [x] Nama folder dan file: `sideBar.foreground`, `list.*`
- [x] Folder expanded dan collapsed: panah memakai `icon.foreground`; ikon folder berasal dari file icon theme, bukan dari tema warna → T2
- [x] Selected item: `list.activeSelectionBackground`, `.activeSelectionForeground`, `.activeSelectionIconForeground`, `list.inactiveSelection*`
- [x] Focused item: `list.focusBackground`, `.focusForeground`, `.focusOutline`, `.focusAndSelectionOutline`, `.inactiveFocusOutline`
- [x] Hover state: `list.hoverBackground`, `.hoverForeground`
- [x] Active/open file: state selection di atas
- [x] File modified (belum disimpan): Explorer tidak menandainya; tandanya ada di tab (`tab.activeModifiedBorder`, titik) dan di Open Editors → T1
- [x] File decorations: `list.errorForeground`, `list.warningForeground`, `gitDecoration.*`
- [x] Indentation guides: `tree.indentGuidesStroke` (aktif, `borderStrong`), `tree.inactiveIndentGuidesStroke` (`line`)
- [x] Context menu: `menu.background`, `.foreground`, `.selectionBackground`, `.selectionForeground`, `.separatorBackground`, `.border`
- [x] Inline actions: `toolbar.hoverBackground`, `toolbar.activeBackground`, `icon.foreground`
- [x] Drag-and-drop: `list.dropBackground`, `list.dropBetweenBackground`, `sideBar.dropBackground`
- [x] **(tambahan)** Hasil filter di tree: `list.highlightForeground`, `list.focusHighlightForeground`, `list.filterMatchBackground`, `.filterMatchBorder`, `listFilterWidget.*`
- [x] **(tambahan)** Item error dan warning: `list.errorForeground`, `list.warningForeground`, `list.invalidItemForeground`

Kriteria:

- [x] Struktur folder mudah dipindai → T2
- [x] Selected, focused dan hovered bisa dibedakan → T2
- [x] Status file mudah dikenali → T2, T9
- [x] Indentation guides terlihat tanpa mengganggu teks → T2
- [x] Ikon dan teks terbaca di tiap tingkat nesting → T2

## 3. Editor

- [x] Latar dan teks: `editor.background`, `editor.foreground`
- [x] Nomor baris: `editorLineNumber.foreground` (`faint`, 3,62:1, pengecualian), `.activeForeground` (`fg`)
- [x] Baris aktif: `editor.lineHighlightBackground`; `editor.lineHighlightBorder` dibuat transparan
- [x] Kursor: `editorCursor.foreground`, `editorMultiCursor.*`
- [x] Seleksi teks: `editor.selectionBackground`, `.inactiveSelectionBackground`, `.selectionHighlightBackground`
- [x] Sorotan kata dan occurrence: `editor.wordHighlight{,Strong,Text}Background` dan `…Border`
- [x] Bracket matching: `editorBracketMatch.background`, `.border`
- [x] Indentation guides: `editorIndentGuide.background1`, `.activeBackground1`
- [x] Whitespace dan karakter kontrol: `editorWhitespace.foreground`, `editorUnicodeHighlight.*`
- [x] Minimap dan slider: `minimap.*`, `minimapSlider.*`, `minimapGutter.*`
- [x] Rulers: `editorRuler.foreground`
- [x] Kontrol code folding: `editorGutter.foldingControlForeground`, `editor.foldBackground`, `editor.foldPlaceholderForeground`
- [x] Overview ruler: `editorOverviewRuler.*`
- [x] Gutter: `editorGutter.addedBackground`, `.modifiedBackground`, `.deletedBackground` dan varian `Secondary`
- [x] Sticky scroll: `editorStickyScroll.*`, `editorStickyScrollHover.background`, `editorStickyScrollGutter.background`
- [x] Inline decorations: `editorCodeLens.foreground`, `editorInlayHint.*`, `editorGhostText.foreground`, `editor.inlineValues*`, `git.blame.editorDecorationForeground`
- [x] Diff editor: `diffEditor.*`, `diffEditorGutter.*`, `diffEditorOverview.*`, `multiDiffEditor.*`
- [x] Merge editor: `merge.*` (current `accent`, incoming `cyan`, common `violet`), `mergeEditor.*`
- [x] **(tambahan)** Bracket pair colorization: `editorBracketHighlight.foreground1`–`6`, `.unexpectedBracket.foreground`, `editorBracketPairGuide.*`
- [x] **(tambahan)** Squiggle dan kode tak terpakai: `editorError.foreground`, `editorWarning.foreground`, `editorInfo.foreground`, `editorHint.foreground`, `editorUnnecessaryCode.opacity`
- [x] **(tambahan)** Inlay hints, CodeLens, ghost text: lihat "Inline decorations"
- [x] **(tambahan)** Find widget, peek view, tautan: `editorWidget.*`, `peekView*`, `editorLink.activeForeground`
- [x] **(tambahan)** Linked editing, snippet tabstop, kode terlipat: `editor.linkedEditingBackground`, `editor.snippet*`, `editor.foldBackground`

Catatan: `editor.foldBackground` tidak boleh buram, jadi dipakai `line` 42%, yang di atas `bg` menghasilkan warna yang hampir sama dengan `hover`.

Kriteria:

- [x] Teks, baris aktif, nomor baris dan kursor jelas → T3
- [x] Seleksi tidak menghilangkan keterbacaan syntax → T3 (angka: semua warna syntax ≥ 4,5:1 di atas seleksi, termasuk pada baris aktif). Satu kasus tidak dipaksakan: sorotan kata **ditumpuk** dengan seleksi pada baris aktif memberi `dim` 3,39:1; ini hanya mengenai komentar yang sekaligus tersorot dan terseleksi
- [x] Bracket pasangan mudah ditemukan → T3
- [x] Error, warning, breakpoint dan perubahan Git bisa dibedakan → T3, T9, T10
- [x] Minimap, scrollbar dan overview ruler tidak mendominasi → T3
- [x] Diff dan merge membedakan perubahan dengan jelas → T9. Alpha diff diturunkan ke 9% + 6% demi kontras (7% + 5% di Float); diterima pada uji manual

## 4. Syntax highlighting

Semua item di bawah diverifikasi otomatis terhadap tabel bagian 4 spesifikasi (75 scope contoh: warna dan gaya huruf harus persis). Yang diperiksa adalah aturan tema, bukan hasil tokenisasi grammar tiap bahasa.

- [x] Komentar (`comment`, `punctuation.definition.comment`; dokumentasi: tag `storage.type.class.jsdoc`, `keyword.other.documentation`, `keyword.other.phpdoc`; nama parameter `variable.other.jsdoc`)
- [x] Keyword (`keyword`, `storage`, `storage.type`, `storage.modifier`, `keyword.control`, `keyword.operator.new`, `keyword.operator.expression`)
- [x] Variabel (`variable`, `variable.other.readwrite`) · [x] Parameter (`variable.parameter`)
- [x] Fungsi · [x] Method (`entity.name.function`, `variable.function`, `meta.function-call.generic`, `support.function`)
- [x] Class · [x] Interface · [x] Type dan type alias (`entity.name.type.*`, `entity.name.class`, `entity.other.inherited-class`, `support.class`, `support.type`)
- [x] Enum dan enum member (`entity.name.type.enum`; `variable.other.enummember`)
- [x] String dan template literal (`string`, `string.template`, `punctuation.definition.template-expression`)
- [x] Angka · [x] Boolean, null, undefined · [x] Konstanta (`constant.numeric`, `constant.language`, `variable.other.constant`, `support.constant`)
- [x] Operator (`keyword.operator`) · [x] Tanda baca dan delimiter (`punctuation`, `meta.brace`)
- [x] Properti objek (`variable.other.property`, `variable.other.object.property`, `meta.object-literal.key`)
- [x] Import dan export (`keyword.control.import`, `.export`, `.from`)
- [x] Decorator/annotation (`entity.name.function.decorator`, `punctuation.decorator`, `meta.decorator …`, `storage.type.annotation`, `meta.attribute.rust`)
- [x] Regular expression (`string.regexp`, `constant.character.escape`, `constant.other.character-class.regexp`, `keyword.operator.quantifier.regexp`)
- [x] Simbol bawaan/support (`support.function`, `support.class`, `support.type`, `support.constant`, `support.variable`: warna kategori + italic)
- [x] **(tambahan)** Tag, atribut, komponen (`entity.name.tag`, `entity.other.attribute-name`, `support.class.component`) · selector, properti, nilai CSS · kunci JSON/YAML (`support.type.property-name.json`, `entity.name.tag.yaml`) · Markdown (`markup.*`) · diff (`markup.inserted`, `.deleted`, `.changed`) · `invalid.illegal`, `invalid.deprecated`

Keputusan yang perlu diketahui:

- Bracket pair colorization (menyala secara bawaan) menimpa warna `dim` untuk kurung.
- `invalid.deprecated` hanya diberi coretan; warnanya tetap warna asal.
- Tanda `$` pada variabel PHP dan shell diberi warna variabel, bukan warna tanda baca.

Bahasa uji: file contoh ada untuk semuanya dan sudah dilihat di editor (T4).

- [x] TypeScript (`sample.ts`) · [x] JavaScript (`sample.js`) · [x] TSX dan JSX (`sample.tsx`, `sample.jsx`) · [x] HTML (`sample.html`) · [x] CSS dan SCSS · [x] JSON dan JSONC · [x] Markdown dan MDX · [x] Python · [x] Java (`Sample.java`) · [x] Go · [x] Rust · [x] PHP · [x] SQL · [x] YAML · [x] XML · [x] Shell/Bash · [x] Dockerfile → semuanya T4

MDX tidak punya grammar bawaan di VS Code; perlu extension MDX supaya `sample.mdx` diwarnai.

Kriteria:

- [x] Kategori utama konsisten dan mudah dibedakan → T4
- [x] Terbaca pada kode padat dan bersarang → T4
- [x] Komentar, string, keyword, fungsi, tipe, properti dan variabel tidak mirip (ΔE terendah 21,2; minimum 12)
- [x] Terbaca pada bahasa tertanam → T4 (`sample.html`, `sample.md`, `sample.php`)
- [x] Warna tidak bergantung pada satu bahasa → T4. Scope khusus bahasa (Go, Rust, PHP, SQL, YAML) ditulis dari pengetahuan tentang grammar-nya, bukan dari hasil Inspect Tokens; uji manual tidak menemukan token yang salah warna

## 5. Semantic highlighting

Tiap token di bawah punya aturan di `semanticTokenColors`, dan warna serta gayanya dibandingkan otomatis dengan aturan TextMate untuk jenis token yang sama (25 pasangan).

- [x] class · [x] interface · [x] enum · [x] function · [x] method · [x] property · [x] variable · [x] parameter
- [x] type · [x] namespace · [x] keyword · [x] decorator · [x] operator · [x] macro · [x] enumMember
- [x] Modifier declaration: sengaja tanpa aturan (warna dan gaya asal); pemeriksaan memastikan aturan itu memang tidak ada
- [x] readonly (`variable.readonly` → `orange`; `property.readonly` tetap `mint`) · [x] static (tebal) · [x] async (italic) · [x] deprecated (coret) · [x] defaultLibrary (italic) · [x] modification (garis bawah)

Tambahan untuk language server tertentu: `typeParameter`, `struct`, `typeAlias`, `trait`, `union`, `record`, `builtinType`, `selfParameter`, `clsParameter`, `selfKeyword`, `lifetime`, `annotation`, `attribute`, `magicFunction`, `number`, `boolean`, `string`, `regexp`, `escapeSequence`, `formatSpecifier`, `comment`, `event`, `modifier`, `constParameter`.

Kriteria:

- [x] Melengkapi TextMate, bukan palet yang bertentangan (dibandingkan otomatis)
- [x] Token dengan makna berbeda bisa dibedakan saat language server menyediakannya → T5
- [x] Modifier diperlakukan konsisten → T5
- [x] Fallback layak saat semantic highlighting tidak tersedia → T4, T5

Perbedaan yang disengaja: variabel `const` lokal di TypeScript berwarna teks biasa menurut TextMate (kecuali di deklarasinya) dan `orange` menurut semantic (`variable.readonly`). Itu mengikuti spesifikasi, tetapi membuat kode TypeScript jauh lebih banyak berwarna `orange` saat semantic menyala. Diterima pada uji manual (T5).

## 6. Terminal

- [x] Latar (`terminal.background` = `surface`) · [x] Teks (`terminal.foreground`) · [x] Kursor (`terminalCursor.foreground`, `.background`) · [x] Seleksi (`terminal.selectionBackground`, `.inactiveSelectionBackground`)
- [x] ANSI Black · [x] Red · [x] Green · [x] Yellow · [x] Blue · [x] Magenta · [x] Cyan · [x] White: 16 ID `terminal.ansi*`, normal ≠ bright untuk tiap pasangan
- [x] **(tambahan)** `terminalCommandDecoration.*`, `terminal.findMatch*`, `terminal.tab.activeBorder`, `terminal.border`, `terminalStickyScroll.*`, `terminalOverviewRuler.*`, `terminalSymbolIcon.*`

Bright black sekarang `#768b7c` (lihat tabel perubahan). ANSI black `#223027` dikecualikan dari syarat kontras teks.

Kriteria:

- [x] 16 slot ANSI punya nilai yang disengaja
- [x] Prompt, output dan seleksi terbaca → T6
- [x] Normal dan bright bisa dibedakan → T6
- [x] Diuji pada output error, log dan alat command-line → T6 (`samples/ansi.sh` di terminal VS Code)

## 7. Panel dan output

- [x] Problems: `problemsErrorIcon.foreground`, `problemsWarningIcon.foreground`, `problemsInfoIcon.foreground`, `list.*`
- [x] Output: `outputView.background`, `outputViewStickyScroll.background`, scope `token.info-token`, `token.warn-token`, `token.error-token`, `token.debug-token`
- [x] Debug Console: `debugConsole.infoForeground`, `.warningForeground`, `.errorForeground`, `.sourceForeground`, `debugConsoleInputIcon.foreground`
- [x] Terminal: bagian 6
- [x] Ports: `ports.iconRunningProcessForeground`, `list.*`, `tree.table*`
- [x] Test Results: `testing.*` ditetapkan, tetapi butuh extension penyedia tes untuk diuji → T7

Kriteria:

- [x] Latar dan teks konsisten → T7
- [x] Error, warning, info dan success dikenali → T7
- [x] Tab aktif dan tidak aktif berbeda → T1, T7
- [x] Output panjang mudah dibaca → T7

## 8. Search & Replace

- [x] Search input · [x] Replace input: `input.background`, `.foreground`, `.border`, `.placeholderForeground`
- [x] Hasil pencarian: `list.*`, `search.resultsInfoForeground`, `badge.*`
- [x] Match highlight: `editor.findMatchHighlightBackground`, `.findMatchHighlightBorder`, `searchEditor.findMatch*`
- [x] Match aktif: `editor.findMatchBackground`, `editor.findMatchBorder`
- [x] Kontrol replace: `button.*`, `toolbar.*`, `inputOption.*`
- [x] Dekorasi pencarian di editor: `editor.findRangeHighlightBackground`, `editorOverviewRuler.findMatchForeground`, `minimap.findMatchHighlight`
- [x] Riwayat pencarian: tidak punya Color ID sendiri; isinya tampil di input yang sama → T8
- [x] **(tambahan)** `inputOption.activeBackground`, `.activeBorder`, `.activeForeground`, `.hoverBackground`; `inputValidation.{info,warning,error}{Background,Foreground,Border}`; placeholder `muted` (5,2:1 di atas latar input)

Kriteria:

- [x] Kontras input dan hasil memadai
- [x] Match aktif berbeda dari lainnya → T8 (beda alpha kecil, 17% vs 10%; pembeda utamanya border penuh)
- [x] Sorotan terbaca di atas syntax (semua warna syntax ≥ 4,5:1 di atas kedua jenis match)
- [x] Fokus pada input dan kontrol jelas → T8

## 9. Source Control (Git)

- [x] Source Control view: `list.*`, `badge.*`, `input.*`, `button.*`
- [x] Modified (`gitDecoration.modifiedResourceForeground`, `amber`) · [x] Added (`.addedResourceForeground`, `accent`) · [x] Deleted (`.deletedResourceForeground`, `coral`) · [x] Renamed (`.renamedResourceForeground`, `cyan`) · [x] Merge conflict (`.conflictingResourceForeground`, `violet`)
- [x] Dekorasi Git di Explorer: ID yang sama
- [x] Baris diff ditambah: `diffEditor.insertedLineBackground`, `.insertedTextBackground`, `diffEditorGutter.insertedLineBackground`
- [x] Baris diff dihapus: `diffEditor.removedLineBackground`, `.removedTextBackground`, `diffEditorGutter.removedLineBackground`
- [~] Baris diff diubah: **didukung sebagian.** Diff editor tidak punya Color ID untuk "diubah"; perubahan tampil sebagai baris dihapus + ditambah. `amber` dipakai untuk baris yang diubah di gutter editor, minimap dan overview ruler
- [x] Inline diff: ID diff yang sama; `inlineChatDiff.*`, `inlineEdit.*`
- [x] **(tambahan)** Untracked (`accent`), ignored (`faint`), submodule (`teal`), stage (`stageModified`, `stageDeleted`); grafik riwayat `scmGraph.*`

Kriteria:

- [x] Added, modified, deleted dan conflict bisa dibedakan → T9
- [x] Dekorasi konsisten antara Explorer, Source Control dan editor (warna yang sama dipakai untuk `gitDecoration.*`, `editorGutter.*`, `minimapGutter.*`, `editorOverviewRuler.*`); tampilannya → T9
- [x] Diff tidak mengurangi keterbacaan kode (angka: ≥ 4,5:1 untuk baris + kata); kesan visual → T9
- [x] Informasi perubahan tidak hanya lewat warna → T9 (huruf M/A/U/D/R dan coretan berasal dari VS Code)

`samples/git-states/setup.sh` sudah dijalankan di folder sementara dan menghasilkan semua status di atas.

## 10. Debugging

- [x] Breakpoint: `debugIcon.breakpointForeground` (`coral`)
- [~] Conditional breakpoint: **didukung sebagian.** VS Code tidak punya Color ID terpisah; ia memakai `debugIcon.breakpointForeground` dengan bentuk ikon berbeda. Warna `amber` dari spesifikasi **tidak bisa diterapkan**
- [x] Baris eksekusi: `editor.stackFrameHighlightBackground` (`amber` 16%), `debugIcon.breakpointCurrentStackframeForeground` (`amber`), `editor.focusedStackFrameHighlightBackground`
- [x] Debug toolbar: `debugToolBar.background`, `.border`, `debugIcon.{start,continue,pause,stop,restart,stepOver,stepInto,stepOut,stepBack,disconnect}Foreground`
- [x] Debug Console: bagian 7
- [x] Variables view · [x] Watch view: `debugTokenExpression.*`, `debugView.valueChangedHighlight`
- [x] Call Stack: `debugView.stateLabel*`, `debugView.exceptionLabel*`, `list.*`
- [x] Status bar debug: `statusBar.debuggingBackground`, `.debuggingForeground`, `.debuggingBorder`, `commandCenter.debuggingBackground`
- [x] Nilai variabel inline: `editor.inlineValuesForeground` (`muted`), `.inlineValuesBackground` (`hover`), 4,73:1
- [~] **(tambahan)** Warna token debug `[x]`, breakpoint nonaktif `[x]` (`debugIcon.breakpointDisabledForeground`), exception widget `[x]` (`debugExceptionWidget.*`); **logpoint didukung sebagian**: sama seperti conditional breakpoint, tidak ada Color ID, jadi `cyan` tidak bisa diterapkan

Kriteria:

- [x] Baris eksekusi jelas → T10
- [x] Breakpoint dan conditional breakpoint mudah dibedakan → T10 (hanya lewat bentuk ikon)
- [x] Nilai inline tidak mengaburkan kode → T10
- [x] State debugging terlihat tanpa mengganggu status lain → T10

## 11. IntelliSense dan language widgets

- [x] Suggest widget · [x] Suggest list: `editorSuggestWidget.background`, `.border`, `.foreground`, `editorSuggestWidgetStatus.foreground`
- [x] Suggestion terpilih: `editorSuggestWidget.selectedBackground`, `.selectedForeground`, `.selectedIconForeground`
- [x] Detail/dokumentasi suggest: `editorWidget.*`, `textLink.*`, `textCodeBlock.background`
- [x] Parameter hints · [x] Signature help: `editorHoverWidget.*`, `editorWidget.*`
- [x] Hover widget: `editorHoverWidget.background`, `.foreground`, `.border`, `.highlightForeground`, `.statusBarBackground`
- [x] Sorotan teks yang cocok: `editorSuggestWidget.highlightForeground`, `.focusHighlightForeground`, `list.highlightForeground`
- [x] Code Actions/Quick Fix: `editorActionList.*`
- [x] Lightbulb: `editorLightBulb.foreground` (`amber`), `editorLightBulbAutoFix.foreground` (`cyan`), `editorLightBulbAi.foreground` (`violet`)
- [x] **(tambahan)** `symbolIcon.*`, 33 ID, mengikuti warna kategori syntax

Kriteria:

- [x] Suggestion aktif jelas → T11
- [x] Detail dokumentasi punya hierarki → T11
- [x] Sorotan cocok tidak mengganggu → T11
- [x] Widget terbaca di atas editor → T11 (kontras teks lulus; pemisahan dari kode bergantung pada border `line` dan bayangan)

## 12. Dialogs, menus dan notifications

- [x] Quick Input · [x] Quick Open · [x] Command Palette: `quickInput.*`, `quickInputTitle.background`, `quickInputList.*`, `pickerGroup.*`, `keybindingLabel.*`
- [x] Context menus: `menu.*`
- [x] Dropdowns: `dropdown.background`, `.listBackground`, `.foreground`, `.border`
- [x] Modal dialogs · [x] Confirmation dialogs: dialog custom memakai `editorWidget.*`, `button.*`, `widget.shadow`. Di macOS dialog bawaannya native dan tidak dikendalikan tema → T12
- [x] Input boxes: `input.*`, `inputValidation.*`
- [x] Notification toast · [x] Notification center: bagian 1
- [x] Progress indicators: `progressBar.background`

Kriteria:

- [x] Popup dan dialog terpisah dari konten di belakangnya → T12
- [x] Item terpilih, hover dan focus jelas → T12
- [x] Input, placeholder, label dan pesan validasi terbaca (kontras lulus); tampilan → T8, T12
- [x] Tombol dan aksi destruktif dikenali → T12. VS Code tidak punya Color ID untuk tombol destruktif; pembedanya teks dan ikon dialog

## 13. Widgets dan specialized UI

- [x] Breadcrumb picker: `breadcrumbPicker.background`
- [x] Color picker: tidak ada Color ID khusus; mengikuti `editorHoverWidget.*` dan `editorWidget.*` → T13
- [~] Date picker: **tidak berlaku.** VS Code tidak punya date picker bawaan dan tidak ada Color ID-nya
- [x] Tree view · [x] List view · [x] Table view: `list.*`, `tree.indentGuidesStroke`, `tree.inactiveIndentGuidesStroke`, `tree.tableColumnsBorder`, `tree.tableOddRowsBackground`
- [x] Settings editor · [x] Settings search: `settings.*`
- [x] Extension Marketplace · [x] Extension details: `extensionButton.*`, `extensionBadge.*`, `extensionIcon.*`
- [x] Welcome/Get Started: `welcomePage.*`, `walkThrough.embeddedEditorBackground`, `walkthrough.stepTitle.foreground`
- [x] Chat view: `chat.*`, `inlineChat.*`, `inlineChatInput.*` ditetapkan; ID `agents*` dibiarkan default (lihat tabel di atas) → T13
- [x] Notebook/Jupyter · [x] Interactive Window: `notebook.*`, `notebookStatus*Icon.foreground`, `notebookScrollbarSlider.*`, `interactive.*`
- [x] Testing view: `testing.icon*`, `testing.runAction`, `testing.peek*`, `testing.message.*`, `testing.covered*`, `testing.uncovered*`
- [x] Timeline view: tidak punya ID sendiri; memakai `list.*`
- [x] Webview / UI milik extension: **keterbatasan, bukan kegagalan.** Tema hanya menyediakan variabel CSS; extension menentukan sendiri pemakaiannya → T13
- [x] **(tambahan)** `charts.*`, `chart.*`, `gauge.*`, ikon hasil tes, `banner.*`, `keybindingTable.*`

Kriteria:

- [x] Komponen bawaan mengikuti palet → T13
- [x] Tree, list, table dan settings punya state selection/focus yang jelas → T13
- [x] UI extension diuji representatif → T13
- [x] Keterbatasan webview dicatat (di sini dan di `README.md`)

## 14. Accessibility dan visual states

- [x] Kontras teks terhadap latar: 1.277 pasangan dihitung, 0 gagal
- [x] Focus indicator: `focusBorder` = `accent`, ≥ 3:1 di atas `bg`, `surface`, `bar`, `hover`, `selectionList`
- [x] State navigasi keyboard: `list.focusOutline`, `list.focusAndSelectionOutline`, `list.inactiveFocusOutline`, `statusBarItem.focusBorder`, `activityBar.activeFocusBorder`
- [x] Selection (`selectionList` + teks `hi`) · [x] Hover (latar `hover`) · [x] Active (teks `hi` + garis `accent`)
- [x] Disabled: `disabledForeground` = `muted`, ≥ 4,5:1 di `bg`, `surface`, `bar`, `hover`
- [x] Error (`coral`) · [x] Warning (`amber`) · [x] Information (`cyan`) · [x] Success (`accent`)
- [~] High Contrast: **tidak ada varian HC.** Tema tidak menetapkan `contrastBorder` atau `contrastActiveBorder` (dipastikan oleh `check-coverage.mjs`), sehingga tema HC bawaan tidak terpengaruh → T14

Pengecualian kontras yang berlaku (dicetak oleh `npm run check:contrast`):

- `faint` (nomor baris, whitespace, file ignored): 3,22–3,62:1, di bawah 4,5:1 sesuai izin spesifikasi.
- `muted` di atas baris list yang terpilih dan terfokus (`selectionList`): 3,80:1. Ini mengenai teks nonaktif atau teks yang sengaja diredupkan di baris terpilih.
- ANSI bright black di atas seleksi terminal: 3,60:1.
- `line` sebagai pemisah: 1,3–1,4:1, tanpa syarat.
- Slider scrollbar saat diam: 1,24:1; saat hover 2,0:1. Spesifikasi meminta slider `line` transparan; ini di bawah 3:1 untuk komponen non-teks. Naikkan alpha di `scripts/build-theme.mjs` kalau terasa sulit ditemukan.

Kriteria:

- [x] Teks penting terbaca pada ukuran normal → T14 (angka lulus)
- [x] Focus indicator jelas → T14
- [x] Hover, focus, active, selected dan disabled tidak tertukar → T14
- [x] Error, warning dan success tidak hanya lewat warna → T14
- [x] Kontras diperiksa dengan alat
- [x] Mode High Contrast tidak menghilangkan informasi → T14

## 15. Final quality gates

- [x] Semua kelompok prioritas utama diperiksa: otomatis dan manual
- [x] Semua Color ID relevan dari dokumentasi resmi dipetakan: 837 dari 971; 134 sisanya dijelaskan di atas
- [~] Tidak ada warna penting yang hanya mengandalkan default tanpa keputusan: keputusan untuk yang dibiarkan default sudah dicatat, tetapi 64 ID UI baru (`agents*`, `modern*`, dan sejenisnya) dibiarkan karena tidak bisa saya nilai, bukan karena sudah diputuskan warnanya
- [ ] ~~Dark/light konsisten secara semantik~~ tidak berlaku: hanya varian gelap
- [x] Syntax diuji pada beberapa bahasa dan file nyata → T4 (file contoh sudah ada)
- [x] Semantic highlighting diuji dengan language server yang sesuai → T5
- [x] Terminal diuji dengan 16 warna ANSI → T6
- [x] Explorer, Source Control, Search, Debug dan Problems diuji → T2, T7, T8, T9, T10
- [x] Popup, dialog, hover, selection dan focus diuji → T11, T12, T14
- [~] Screenshot dokumentasi dibuat untuk area utama → T15. **Sebagian:** `images/NubiBuilds_Cover.png` (dibuat pemilik proyek) memuat tangkapan layar asli editor dan Explorer untuk ketiga tema, dan menjadi sampul `README.md`. Terminal, Source Control, debug, Command Palette dan diff belum punya tangkapan layar. Selain itu `images/` berisi 22 gambar pratinjau hasil render (20 bahasa di NubiBuilds Dark, ditambah TypeScript di Void dan Float), dibuat dari grammar TextMate bawaan VS Code dan warna tema. Itu bukan tangkapan layar jendela VS Code: tidak memuat semantic highlighting, warna pasangan kurung, maupun workbench (Explorer, terminal, debug, Command Palette, diff). MDX tidak dirender karena VS Code tidak punya grammar bawaannya. Gambar pratinjau itu ada di `images/README.md`, belum di `README.md`
- [x] README menjelaskan tema dan cara mengaktifkannya
- [x] Pengemasan VSIX berhasil: `nubibuilds-dark-0.1.0.vsix` (31,2 KB, 8 file, tiga tema), tanpa flag pengecualian. `package.json` punya `repository` (GitHub) dan lisensi MIT (`LICENSE`, field `license`)
- [x] Extension diuji melalui Extension Development Host → T0
- [x] Batasan UI extension/webview didokumentasikan

Kriteria kelulusan rilis awal:

1. [x] Workbench, Explorer, Editor, Syntax, Terminal dan Accessibility lulus pemeriksaan dasar: otomatis dan manual
2. [x] Tidak ada teks atau kontrol penting yang sulit dibaca: angka lulus, uji manual tanpa temuan
3. [x] Hover, focus, active, selected, error dan warning dikenali
4. [x] Syntax konsisten pada bahasa utama
5. [x] Pengujian dilakukan di Extension Development Host, bukan hanya dari inspeksi JSON
6. [x] Keterbatasan extension/webview dicatat
