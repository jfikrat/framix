# Framix Animation & Motion Graphics Guide

> Instagram, TikTok, YouTube Shorts icin reklam, tanitim ve motion graphic uretim rehberi.
> Son guncelleme: 2026-02-07

---

## Icerikler

1. [Platform Teknik Spesifikasyonlari](#1-platform-teknik-spesifikasyonlari)
2. [Safe Zone Kurallari](#2-safe-zone-kurallari)
3. [Animasyonun 12 Prensibi (Motion Graphics Uyarlamasi)](#3-animasyonun-12-prensibi)
4. [Easing & Timing Kurallari](#4-easing--timing-kurallari)
5. [Tipografi Animasyon Kurallari](#5-tipografi-animasyon-kurallari)
6. [Renk Psikolojisi](#6-renk-psikolojisi)
7. [Instagram Reklam Stratejileri](#7-instagram-reklam-stratejileri)
8. [2025-2026 Motion Graphics Trendleri](#8-2025-2026-motion-graphics-trendleri)
9. [Loop Teknikleri](#9-loop-teknikleri)
10. [Engagement Verileri](#10-engagement-verileri)
11. [Export Ayarlari](#11-export-ayarlari)
12. [Framix'e Ozel Uygulama Notlari](#12-framixe-ozel-uygulama-notlari)

---

## 1. Platform Teknik Spesifikasyonlari

### Instagram

| Format | Cozunurluk | Oran | FPS | Bitrate | Codec | Max Boyut | Max Sure |
|--------|-----------|------|-----|---------|-------|-----------|----------|
| **Reels** | 1080x1920 | 9:16 | 30 | 4000-6000 kbps | H.264 + AAC (48kHz) | 4 GB | 15 dk |
| **Stories** | 1080x1920 | 9:16 | 30 | 3000-4000 kbps | H.264 + AAC | 100 MB | 60s/clip |
| **Feed (Kare)** | 1080x1080 | 1:1 | 30 | 3500-5000 kbps | H.264 + AAC | 100 MB | 90s |
| **Feed (Dikey)** | 1080x1350 | 4:5 | 30 | 3500-5000 kbps | H.264 + AAC | 100 MB | 90s |
| **Feed (Yatay)** | 1080x566 | 1.91:1 | 30 | 3500-5000 kbps | H.264 + AAC | 100 MB | 90s |

### TikTok

| Ozellik | Deger |
|---------|-------|
| Cozunurluk | 1080x1920 (9:16), 4K kabul edilir ama 1080p'ye dusurulur |
| FPS | 30 fps sabit (onerilen), 60 fps desteklenir ama agir sikistirilir |
| Bitrate | 8-15 Mbps VBR, 5 Mbps altinda kalite duser |
| Codec | H.264 + AAC (MP4 container) |
| Boyut | Android: 72 MB, iOS: 287 MB, Web: 500 MB |
| Sure | Uygulama: 10 dk, Web: 60 dk, **Ideal: 21-34 saniye** |

### YouTube Shorts

| Ozellik | Deger |
|---------|-------|
| Cozunurluk | 1080x1920 (9:16) |
| FPS | 30 min, 60 onerilen (hizli hareket icin) |
| Bitrate | 8-12 Mbps |
| Codec | H.264 + AAC-LC veya Opus |
| Boyut | 2 GB'a kadar |
| Sure | 3 dakikaya kadar, **ideal: ~55 saniye** |

### FPS Rehberi

| Icerik Tipi | Onerilen FPS | Neden |
|-------------|-------------|-------|
| Standart motion graphics | **30 fps** | Temiz hareket, evrensel destek, kucuk dosya |
| Hizli aksiyon/spor | 60 fps | Hareket bulaniklarini azaltir |
| Sinematik his | 24 fps | Film benzeri, hafif hareket bulanikligi |
| **Coklu platform export** | **30 fps** | En guvenli evrensel secim |

> **Onemli**: 24 fps her yerde kabul edilir ama telefon ekranlarinda "takilan" gibi hissedilir. **30 fps, motion graphics reklamlar icin en guvenli secim.**

---

## 2. Safe Zone Kurallari

Platform UI elemanlari (profil resimleri, altyazilar, begeni/yorum butonlari) videonun kenarlarini orter. Bu alanlardaki icerik gorunmez olur.

### Instagram Reels (1080x1920)

```
+----------------------------------+
|         UST: %14 (~270px)        |  <- Profil bilgisi, saat
|         TEHLIKELI BOLGE          |
|+------+--------------------+----+|
||      |                    |    ||
|| SOL  |   GUVENLI ALAN     | SAG||
|| %6   |   ~950 x 980 px   | %6 ||
|| 65px |   Tum onemli       |65px||
||      |   icerik BURAYA    |    ||
|+------+--------------------+----+|
|                                  |
|       ALT: %35 (~670px)         |  <- Altyazi, begeni, yorum
|       TEHLIKELI BOLGE            |
+----------------------------------+
```

### TikTok (1080x1920) — En Kisitlayici

```
+----------------------------------+
|         UST: %14 (~270px)        |
|+--------+----------------+------+|
||        |                |      ||
|| SOL    |  GUVENLI ALAN  | SAG  ||
|| %11    |                | %22  ||
|| 119px  |                |238px ||
||        |                |      ||
|+--------+----------------+------+|
|       ALT: %45 (~864px)         |  <- Yorumlar, paylasim, profil
+----------------------------------+
```

### YouTube Shorts (1080x1920)

```
+----------------------------------+
|         UST: %15 (~288px)        |
|+----+----------------------+----+|
||    |                      |    ||
||SOL |    GUVENLI ALAN      |SAG ||
||%4  |                      |%18 ||
||43px|                      |194p||
|+----+----------------------+----+|
|       ALT: %35 (~672px)         |
+----------------------------------+
```

### Evrensel Kural

> **Tum kritik metin, logo ve CTA'lari cercevenin merkez %60-70'lik alaninda tutun.**
> Merkezden disa dogru tasarlayin. Kenar alanlari dekoratif/onemsiz elemanlar icin kullanin.

---

## 3. Animasyonun 12 Prensibi

Disney animatorleri tarafindan tanimlanan, tum profesyonel motion calismalarin temeli:

### 1. Squash & Stretch (Ezilme & Gerilme)
Logo reveal'larda, buton basimlarinda, ziplayan metinlerde kullanilir. Deformasyonu abartmak agirlik ve esneklik hissi verir.

**Framix uygulamasi**: `spring()` ile `stiffness` yuksek, `damping` dusuk degerler.

### 2. Anticipation (Beklenti)
Metin kayarak girmeden once hafif bir geri cekilme, buyumeden once kisa bir kuculmedir. Izleyiciyi ana harekete hazirlar.

**Framix uygulamasi**: Ana animasyon oncesi -10% yon icin `interpolate()`.

### 3. Staging (Sahneleme)
Kompozisyon ve animasyon hizi, urun/mesaji kahraman olarak tutar. Karede her sey odak noktasina dikkat cekmeli.

### 4. Straight Ahead vs Pose to Pose
Motion graphics'te **Pose to Pose** (keyframe-driven) baskindir. Baslangic/bitis durumlarini tanimla, aradegimlemeyi ince ayarla.

### 5. Follow Through & Overlapping Action (Devam & Ust Uste Hareket)
Ikincil elemanlar (alt basliklar, ikonlar, partikuller) ana eleman durduktan sonra hafifce hareket etmeye devam eder. Organik his yaratir.

**Framix uygulamasi**: Elemanlar arasinda 3-5 frame gecikme (`frame - delay`).

### 6. Slow In & Slow Out (Yavasla & Hizlan)
Easing'in temeli — elemanlar sabit hizda hareket etmek yerine hizlanir ve yavaslar.

**Framix uygulamasi**: `easing.easeInOut`, `easing.easeOut` kullanimi.

### 7. Arcs (Yaylar)
Dogal hareket egri yollar izler. Metin ve nesneler yay uzerinde hareket etmeli, katı duz cizgilerde degil.

### 8. Secondary Action (Ikincil Hareket)
Arka plan partikuleri, ince gradient kaymalari veya birincil mesaji destekleyen kucuk ikon animasyonlari.

### 9. Timing (Zamanlama)
Her eylemin ne kadar surdugunu belirler:
- **Hizli** = enerjik/acil
- **Yavas** = zarif/luks

Dogrudan duygusal tepkiyi kontrol eder.

### 10. Exaggeration (Abartma)
Pozisyon asimi (overshoot), asiri olcekleme veya abartili sigramalar. Animasyonlari canli yapar.

**Framix uygulamasi**: `spring({ stiffness: 200, damping: 10 })` overshoot yaratir.

### 11. Solid Drawing (Saglam Cizim)
Motion graphics'te: tutarli gorsel agirlik, uygun derinlik ipuclari ve tum elemanlarda boyutsal tutarlilik.

### 12. Appeal (Cazibe)
Temiz tasarim, tatmin edici hareket ve gorsel cilalama. Izleyicilerin tekrar izlemek istedigi "tuhaf derecede tatmin edici" kalite.

---

## 4. Easing & Timing Kurallari

### Easing Turleri

| Easing | Cubic Bezier | Kullanim |
|--------|-------------|----------|
| **Linear** | `(0.0, 0.0, 1.0, 1.0)` | Mekanik/robotik his. Reklamlarda nadir. |
| **Ease** | `(0.25, 0.1, 0.25, 1.0)` | Genel amacli purussuz hareket. |
| **Ease-In** | `(0.42, 0, 1.0, 1.0)` | Ekrandan cikan elemanlar. Yavas baslar, hizli biter. |
| **Ease-Out** | `(0, 0, 0.58, 1.0)` | Ekrana giren elemanlar. Hizli baslar, yavaslar. Yalayici. |
| **Ease-In-Out** | `(0.42, 0, 0.58, 1.0)` | Durumlar arasi gecis. Zarif, dengeli. |

### Reklam Icin Gelismis Easing

| Tip | Cubic Bezier | Etki |
|-----|-------------|------|
| **Overshoot/Bounce** | `(0.34, 1.56, 0.64, 1)` | Hedefi gecip geri gelir |
| **Snappy Giris** | `(0.0, 0.0, 0.2, 1.0)` | Cok hizli baslangic, yumusak yerlesmedir. Metin reveal icin ideal. |
| **Dramatik Cikis** | `(0.7, 0.0, 1.0, 1.0)` | Yavas baslar, hizli cikar |

### Framix Easing Fonksiyonlari

```typescript
// animations.ts'deki mevcut easingler
easing.linear       // Sabit hiz
easing.easeIn       // Yumusak basla
easing.easeOut      // Yumusak bitir
easing.easeInOut    // Her ikisi
easing.bounceOut    // Sicrayan bitis
easing.elastic      // Esnek overshoot
easing.cubicIn      // Kubik giris
easing.cubicOut     // Kubik cikis
```

### Zamanlama Kurallari

| Kural | Deger |
|-------|-------|
| Rahat okuma hizi | **180-220 kelime/dakika** (~3-4 kelime/saniye) |
| 7 kelimelik satir | **1.8-2.5 saniye** ekranda kalmali |
| Metin yerlestikten sonra | En az **0.5 saniye** okunabilir kalmali |
| Ayni elemanda es zamanli ozellik | Max **3** (position + scale + opacity). 4. ozellik anlama dusurur. |
| Hook suresi | Ilk **3 saniye** icinde dikkat cekici gorsel/metin |

### Spacing (Aralik) Tipleri

- **Linear**: Frameler arasi esit mesafe. Sabit hiz. Mekanik hissettirir.
- **Ease Out**: Basta yakin, sonda uzak. Hizlanma etkisi.
- **Ease In**: Tam tersi. Yavaslanma etkisi.
- **Easy Ease**: Basta ve sonda yakin, ortada genis. UI ve reklamlar icin en dogal.

---

## 5. Tipografi Animasyon Kurallari

### Font Secimi

| Kategori | Ornekler | Not |
|----------|---------|-----|
| **Animasyona uygun** | Futura, Montserrat, Bebas Neue | Bold geometrik sans-serif |
| **Degisken agirlik** | Inter, Roboto Flex | Animasyonlu weight/width |
| **KULLANMA** | Ince script, dekoratif fontlar | Harekette okunamaz hale gelir |

### Animasyon Teknikleri

1. **Temel reveal'lar**: Fade-in, yonden kayma, scale up/down
2. **Her zaman easing ile** (asla linear degil)
3. **Harf harf**, **kelime kelime** veya **mask wipe** reveal'lar en etkili
4. **Letter-spacing animasyonu**: Kelimeler "nefes alir" — anahtar kelime vurgusu icin
5. Metin animasyonunu **seslendirme ile senkronize et**

### Hiyerarsi

| Eleman | Animasyon Ozelligi |
|--------|-------------------|
| Basliklar | Buyuk genlik, uzun sure |
| Govde metni | Kisa, ince hareketler |
| CTA | En kararli, en net bolum |

### Okunabilirlik

- Minimum font boyutu: Mobil ekranlarda (~6.5 inc) okunabilir olmali
- Yuksek kontrastli metin/arka plan kombinasyonlari **zorunlu**
- Metin elemanlari etrafinda **%20 negatif alan** birakin
- Metin yerlestikten sonra bir sonraki animasyondan once en az **0.5 saniye** bekleyin
- Asiri hareket yetiskinlerin **~%35'inde** vestibular rahatsizlik tetikler

---

## 6. Renk Psikolojisi

### Reklamlarda Renk Etkileri

| Renk | Psikolojik Etki | Donusum Etkisi |
|------|----------------|----------------|
| **Kirmizi** | Aciliyet, heyecan, tutku | Kirmizi CTA butonlari **%34** daha fazla donustur. Yesile karsi **%21** daha iyi. |
| **Mavi** | Guven, guvenlik, profesyonellik | Facebook, LinkedIn, PayPal — guvenilirlik icin |
| **Yesil** | Buyume, saglik, cevre dostu | RIPT Apparel: siyahtan yesile geciste **%6.3** donusum artisi |
| **Sari/Turuncu** | Iyimserlik, enerji, sicaklik | Yuksek gorunurluk, CTA'lar icin etkili |
| **Siyah** | Luks, sofistike, guc | Premium konumlandirma |

### Istatistikler

- Tuketicilerin **%85'i** markayı renge gore secer
- Renkli bilgi hatirlama oranini **%82** arttirir
- Renkli reklamlar **%42** daha fazla gorsel etkilesim alir
- Tutarli marka renkleri **%39** daha yuksek kullanici etkilesimi saglar
- Stratejik renk semalari ziyaretci dikkatini **%26** daha uzun tutar

---

## 7. Instagram Reklam Stratejileri

### 3 Saniye Kurali

Platformlar "intro retention" — ilk 3 saniyeyi gecen izleyici yuzdesini olcer.
**Basarili icerikler %70+ intro retention elde eder:**

- Ilk karede etkileyici gorseller veya sasirtici ifadeler
- Aninda deger sunumu
- Sessiz izleyiciler icin kalin metin overlay'leri (sosyal medya videolarinin **%85'i** sessiz izlenir)

### Hook Stratejileri

1. **Yuksek kontrastli hareket** — ani renk degisimi, parlama
2. **Beklenmedik gorsel** — sasirtan baslangic
3. **Dogrudan soru** — izleyiciyi dusunmeye zorlama
4. **Bold metin** — ilk frame'de net mesaj

### Donusum Icin Ne Ise Yarar

- Motion graphics statik postlara gore **%49'a kadar daha fazla** etkilesim
- Hareket tabanli icerik donusum oranlarini **%80** artirabilir
- Hareket iceren Stories reklamlari statik olanlara gore onemli olcude daha az atlanir
- 30 saniye altinda, kalin metin overlay'leri olan Instagram Reels reklamlari (Meta onerisi)

### Dikkat Edilecek Kurallar

1. **Dikey oncellikli**: 9:16 orani ekran alanini maksimize eder
2. **Feed icin 4:5**: 1:1 yerine 4:5 tercih edin — daha fazla ekran alani kaplar
3. **Organik gorunum**: Reklam gibi degil, organik icerik gibi gorunen reklamlar **surekli** daha iyi performans gosterir
4. **Altyazi entegrasyonu**: Altyazilari motion tasarimina entegre edin, ustune overlay olarak eklemeyin
5. **Simulie edilen etkilesim**: Instagram'in yerel interaktif elemanlarini (anket cikartmalari, kaydiricilar) taklit eden tasarim

---

## 8. 2025-2026 Motion Graphics Trendleri

### 1. Kinetik Tipografi
Kisa bicimli video icin baskin trend. Ilk saniyede dikkat ceken animasyonlu metin. Ezilme, gerilme ve dinamik reveal'lar. Markali icerik icin en cok talep edilen stil.

### 2. Minimalist Maksimalizm
Temiz duzenleme ve bol bosluk + canli renkler, buyuk tipografi ve dramatik gecisler. Celiskiyi dikkat cekici yapan gorsel gerilim.

### 3. 2D Kompozisyonlarda 3D Varliklar
3D render edilmis elemanlar (urunler, logolar, soyut sekiller) duz 2D motion tasarimlarina entegre edilir. Ekrandan firlayan "3D billboard'lar".

### 4. Sivi Hareket & Donusum (Morphing)
Esnek gecisler, akan sekiller ve kesintisiz donguler. Organik, buyuleyici ve dogal olarak dongulenebilir. Urun tanitimi ve marka kimligi icin.

### 5. Kolaj & Analog Estetik
El yapimi dokular (kagit, boya, kumas) + dijital animasyon. VHS ve CRT ekran overlay'leri. Cilalanmis kurumsal gorsellere karsi ozgunluk ve samimiyetin onculeri.

### 6. AI Destekli Hareket
Otomatik stil onerileri, gercek zamanli ayarlamalar ve hiper gercekci gorseller icin yaratici ortak olarak AI. Kissellestirilmis ciktiyla daha hizli uretim dongusu.

### 7. Ses Senkronlu Hareket
TikTok ve Instagram ses zengin icerigi onceliklendirdikce, hareketi muzik vuruslarina veya ses efektlerine senkronize etmek artik beklenti. Sessiz videolar bile "gorsel ritim"den faydalanir.

### 8. Lo-Fi & Dokulu Estetik
"Asiri cilalanmis" kurumsal grafiklerden uzaklasmak. Grain, kagit dokusu, el cizimi doodle'lar ve "kusurlu" gecisler. Kullanici uretimi icerige yakin gorunmek guveni arttirir.

---

## 9. Loop Teknikleri

Kesintisiz dongu ortalama izleme suresini arttirir — izleyiciler genellikle kaydirmadan once 2-3 dongu izler.

### 1. Seamless Loop (Kesintisiz Dongu)
Bitis durumu baslangic durumuyla tam olarak eslesmeli. Izleyici dongunun nerede basladigini anlayamamali.

```typescript
// Framix'te seamless loop
const progress = (frame % durationInFrames) / durationInFrames;
const rotation = interpolate(progress, [0, 1], [0, 360]);
```

### 2. Sivi/Donusum Donguleri
Surekli donusen akan sekiller. Hipnotik ve sonsuz izlenebilir.

### 3. Ping-Pong Donguleri
Animasyon ileri oynar sonra ters doner. Basit ama etkili.

```typescript
// Ping-pong hesaplamasi
const cycle = frame % (durationInFrames * 2);
const pingPong = cycle < durationInFrames
  ? cycle / durationInFrames
  : 1 - (cycle - durationInFrames) / durationInFrames;
```

### 4. Kadirimli Eleman Donguleri
Bireysel elemanlar farkli dongulerle tekrarlar, basit bilesenlerden karmasik gorsel desenler olusturur.

```typescript
// Farkli hizlarda donguler
const element1 = (frame % 60) / 60;   // 2 saniyelik dongu
const element2 = (frame % 90) / 90;   // 3 saniyelik dongu
const element3 = (frame % 45) / 45;   // 1.5 saniyelik dongu
```

### 5. Ritmik Donguler
Bir vurusu veya tempoya senkronize edilen hareket, ses ile tekrarlayacak sekilde tasarlanir.

---

## 10. Engagement Verileri

### Platform Karsilastirmasi (2025-2026, 70M+ post analizi)

| Platform | Engagement Rate | YoY Degisim |
|----------|----------------|-------------|
| **TikTok** | %3.70 | +%49 |
| **Instagram** | %0.48 | -%4 |
| **Facebook** | %0.15 | Sabit |
| **X (Twitter)** | %0.12 | -%20 |

### Instagram Format Karsilastirmasi

| Format | Engagement | Erisim Avantaji | Not |
|--------|-----------|----------------|-----|
| **Carousel** | %0.55 - %10.15 | Baseline | En yuksek kaydetme; Reels'in 2x kaydedilir |
| **Reels** | %0.50 | Carousel'den +%36, fotodan +%125 | Gosterim/kesif icin en iyi |
| **Statik Gorsel** | %0.45 | En dusuk | Uretmesi en basit |
| **Karisik Carousel** (gorsel + video) | %2.33 | — | En iyi carousel alt tipi |

### Ideal Video Sureleri

| Platform | Tatli Nokta | Max (Terk Baslamadan) |
|----------|-----------|----------------------|
| **TikTok** | 21-34 saniye | 60s keskin dusus |
| **Instagram Reels** | 15-45 saniye | 60s+ keskin tutma dususu |
| **YouTube Shorts** | 50-58 saniye | 3 dk (ama 60s alti en iyi) |

> **Kritik icgorusu**: %70 tamamlama oranli 45 saniyelik video, %40 tamamlama oranli 15 saniyelik videodan **daha iyi performans gosterir**. Tamamlama orani ham sureden daha onemli.

---

## 11. Export Ayarlari

### Evrensel Export Sablonu

```
Format:          H.264 (.mp4)
Cozunurluk:      1080 x 1920 (dikey) veya 1080 x 1080 (kare)
Frame Rate:      30 fps (sabit, degisken DEGIL)
Bitrate Modu:    VBR, 2 pass
Hedef Bitrate:   8-12 Mbps
Max Bitrate:     15 Mbps
Ses Codec:       AAC-LC
Ses Bitrate:     256 kbps
Ornekleme Hizi:  48,000 Hz
Kanallar:        Stereo
Renk Alani:      Rec. 709
```

### Framix FFmpeg Komutu (mevcut render.ts'deki)

```bash
ffmpeg -framerate 30 \
  -i frame-%05d.png \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -preset fast \
  output.mp4
```

### Optimize Edilmis FFmpeg Komutu (Onerilir)

```bash
ffmpeg -framerate 30 \
  -i frame-%05d.png \
  -i audio.wav \               # Ses varsa
  -c:v libx264 \
  -pix_fmt yuv420p \
  -preset slow \                # Daha iyi sikistirma
  -crf 18 \                     # Yuksek kalite (18-23 arasi)
  -profile:v high \
  -level 4.0 \
  -b:v 8M \                     # 8 Mbps hedef
  -maxrate 12M \                # 12 Mbps max
  -bufsize 16M \
  -c:a aac \
  -b:a 256k \
  -ar 48000 \
  -ac 2 \
  -movflags +faststart \        # Web icin hizli baslama
  output.mp4
```

> **Onemli**: Tum platformlar yuklenen videolari yeniden kodlar. Cift sikistirma artifaktlarini en aza indirmek icin **platform limitleri icerisinde en yuksek kalitede** yukleyin.

---

## 12. Framix'e Ozel Uygulama Notlari

### Mevcut Video Preset'leri (animations.ts)

```typescript
instagramStory:  1080x1920 @ 30fps, 5s   (150 frame)
instagramPost:   1080x1080 @ 30fps, 5s   (150 frame)
instagramReel:   1080x1920 @ 30fps, 15s  (450 frame)
youtube:         1920x1080 @ 30fps, 5s   (150 frame)
youtubeShort:    1080x1920 @ 30fps, 15s  (450 frame)
tiktok:          1080x1920 @ 30fps, 15s  (450 frame)
```

### Template Olusturma Kontrol Listesi

Yeni template yazarken su kurallara uy:

- [ ] **3 Saniye Kurali**: Ilk 90 frame (3s @ 30fps) icinde hook
- [ ] **Safe Zone**: Kritik icerik merkez %60-70'te
- [ ] **Easing**: Her animasyonda `easing.easeOut` veya `spring()` kullan, asla linear
- [ ] **Tipografi**: Bold sans-serif, yuksek kontrast, min 0.5s okuma suresi
- [ ] **Zamanlama**: Ayni elemanda max 3 es zamanli ozellik animasyonu
- [ ] **Follow Through**: Elemanlar arasi 3-5 frame gecikme
- [ ] **Loop**: Seamless loop icin son frame = ilk frame kontrolu
- [ ] **CTA**: Son 3-5 saniyede en kararli ve en net eleman

### Animasyon Kaliplari (Framix Ornekleri)

#### Hook Giris (Ilk 3 saniye)

```typescript
// Frame 0-90: Guclu hook
const hookScale = spring({ frame, fps, config: { stiffness: 200, damping: 12 } });
const hookOpacity = interpolate(frame, [0, 15], [0, 1], { clamp: true });
```

#### Metin Reveal (Kelime Kelime)

```typescript
const words = text.split(' ');
words.map((word, i) => {
  const delay = i * 8; // 8 frame aralik
  const wordProgress = spring({
    frame: frame - delay,
    fps,
    config: { stiffness: 180, damping: 14 }
  });
  const y = interpolate(wordProgress, [0, 1], [30, 0]);
  const opacity = interpolate(wordProgress, [0, 1], [0, 1]);
  // ...
});
```

#### Overshoot Animasyonu

```typescript
// Hedefi gecip geri gelen animasyon
const overshoot = spring({
  frame,
  fps,
  config: {
    stiffness: 200,  // Yuksek = hizli
    damping: 8,      // Dusuk = daha fazla overshoot
    mass: 1
  }
});
```

#### Staggered Giris (Kadimli Elemanlar)

```typescript
const items = ['Ozellik 1', 'Ozellik 2', 'Ozellik 3'];
items.map((item, i) => {
  const staggerDelay = i * 10; // Her eleman 10 frame sonra
  const progress = spring({
    frame: Math.max(0, frame - startFrame - staggerDelay),
    fps,
    config: { stiffness: 150, damping: 15 }
  });
  // x: soldan kayma, opacity: fade in
  const x = interpolate(progress, [0, 1], [-50, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  // ...
});
```

### Ses Senkronizasyonu Notlari

Framix'in audio engine'i BBT (Bar/Beat/Tick) zamanlama destekler:

```typescript
// Muzik vuruslarina senkronize animasyon
const audioTrack: AudioTrack = {
  bpm: 120,
  events: [
    { bbt: { bar: 1, beat: 1, tick: 0 }, duration: 10, waveform: 'sine', frequency: 60 },
    // Her beat'te bir kick = gorsel vurgu noktasi
  ]
};

// Template'de beat zamanlamasini kullan
const beatFrame = (bar: number, beat: number) =>
  Math.round(((bar - 1) * 4 + (beat - 1)) * (fps * 60 / bpm));
```

---

## Kaynaklar

- Adobe: 12 Principles of Animation
- Social Insider: Social Media Benchmarks 2026
- Strike Social: Safe Zone Guides
- Envato: Motion Design Trends 2025
- FilterGrade: Motion Graphics Trends 2026
- Pixflow: Codec Cheat Sheet & Motion Design
- Meta: Instagram Ad Specifications
- Kapwing: Social Media Video Sizes 2026
- Sprout Social: Video Specs Guide
- MDN: cubic-bezier Reference
