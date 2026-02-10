# Lessons Learned

Son guncelleme: 2026-02-10

## 1. Remotion vs Framix (2026-02-09)

### Remotion Deneyimi
- Remotion'un guclu yanlari: Sequence, interpolate, spring, Studio timeline editoru
- Remotion'un GSAP'a ihtiyaci yok — kendi animasyon primitifleri yeterli
- **Kritik sorun**: Remotion preview'da CSS `transform: scale()` kullaniyor. WebGL/r3f Canvas `ResizeObserver` ile fiziksel piksel boyutu aliyor, CSS scale'i gormuyor. Sonuc: r3f icerigi sadece sol ust ceyrekte gorunuyor
- React Three Fiber (r3f) Remotion'da CALISMAZ (preview modunda). Sadece render modunda duzgun calisir
- HTML5 Canvas 2D ise CSS scale'e uyum saglar, sorunsuz calisir

### Framix'e Tasinan Konseptler
- `Sequence` component — time slicing, local frame context
- `useCurrentFrame()` / `useVideoConfig()` — context hooks
- `FrameProvider` — Player'a entegre, Sequence'in calismasi icin sart
- `interpolate` easing destegi eklendi (ikinci parametre)
- Spring physics zaten vardi, oldugu gibi kaldi

### Onemli Karar
- Remotion yerine framix'te kalmaya karar verildi ("kendi evimizde kalalim")
- Remotion'un en iyi fikirleri port edildi, bagimlilik eklenmedi
- r3f framix'te calisir — CSS scale sorunu VARDI ama cozuldu (bkz. Lesson 6)

## 2. Logo / Ikon Stratejisi (2026-02-09)

### Emoji Kulllanma
- Emoji ikonlar profesyonel durmuyor
- Her platformda farkli gorunuyor
- Render'da tutarsiz sonuc veriyor

### Cozum: Simple Icons (NPM)
- `simple-icons` paketi: 3000+ marka logosu, exact SVG path data
- Kullanim: path string'i alip `<svg viewBox="0 0 24 24"><path d={...} /></svg>` ile render
- Apple, Meta, X (Twitter), TikTok gibi buyuk markalar mevcut
- Goldman Sachs gibi olmayan markalar icin: inline SVG monogram (GS kutu icinde)
- Fallback: emoji (checkered flag gibi evrensel semboller icin)

### Asset Yonetimi
- `public/` klasorunde statik dosyalar (cobrain-logo.png gibi)
- Template'ler arasi ortak asset sistemi henuz yok
- Gelecekte: `public/brands/` klasoru + ortak BrandIcon component'i

## 3. Animasyon Mimarisi (2026-02-09)

### Ne Zaman Ne Kullanilir
| Araç | Kullanim | Ornek |
|------|----------|-------|
| `interpolate` | Basit A→B gecis | Fade, slide, scale |
| `spring` | Fizik tabanli bounce | Giris animasyonlari, ikonlar |
| `easing.*` | interpolate icinde | easeOutCubic slide, easeInCubic exit |
| GSAP `useTimeline` | Coklu adim, karmasik sira | Color streak, stagger |
| GSAP `useStagger` | N item'i sirali animate | Liste giris animasyonu |

### Mimari Kural
- Basit animasyonlar: interpolate + spring (GSAP'siz)
- Karmasik timeline: GSAP useTimeline (paused + seek)
- GSAP asla DOM'a dokunmaz — sadece plain JS object animate eder

## 4. Player FrameProvider (2026-02-09)

- Player'da HEM fullscreen HEM normal modda `<FrameProvider>` sarmak SART
- Unutulursa: Sequence/useCurrentFrame "must be used within FrameProvider" hatasi verir
- Normal modda eksik olduğu tespit edildi ve duzeltildi

## 5. r3f CSS Scale Sorunu ve Cozumu (2026-02-10)

### Sorun
Player.tsx template'i tam video boyutunda render edip (ornegin 1920x1080) CSS `transform: scale()` ile preview alanina sigdirir. DOM elementleri bununla sorunsuz calisir. Ancak r3f Canvas'in boyut olcum kutuphanesi (`react-use-measure`) `getBoundingClientRect()` kullanir — bu fonksiyon ancestor CSS transform'larini hesaba katar ve scale'lenmis kucuk boyutu dondurur. Three.js bu boyutu alip hem WebGL buffer'i hem canvas.style boyutunu kucuk set eder. Sonuc: 3D icerik sol ust kosede kucuk render olur.

### Kok Neden
```
Player: div 1920x1080 → transform: scale(0.31) → gorsel ~600x337
r3f: getBoundingClientRect() → 600x337 rapor eder (transform dahil)
Three.js: gl.setSize(600, 337) + canvas.style = 600x337
Sonuc: 1920x1080 kutuda 600x337 canvas → sol ust kose
```

### Cozum (FramixCanvas - src/three.tsx)
1. **`resize={{ offsetSize: true }}`** — react-use-measure'a `getBoundingClientRect()` yerine `element.offsetWidth/Height` kullanmasini soyler. offsetWidth/Height ancestor CSS transform'lardan etkilenMEZ → dogru 1920x1080 doner
2. **SizeEnforcer component** — guvenlik agi. Her frame'de canvas buffer boyutunu kontrol eder. Yanlissa `gl.setSize(w, h, false)` ile duzeltir (false = CSS style'a dokunma) + kamera aspect ratio'sunu gunceller

### Onemli Notlar
- `dpr={1}` kullan — CSS scale altinda dpr:2 gereksiz buyuk buffer olusturur
- `preserveDrawingBuffer: true` — Puppeteer screenshot'larinda WebGL iceriginin gorunmesi icin SART
- `useCurrentFrame()` Canvas icinde CALISMAZ (r3f ayri React reconciler olusturur, FrameContext gecmez). frame/config'i prop olarak gec
- Remotion'da AYNI sorun var ve cozumu YOK (preview modunda r3f calismaz). Framix'te cozuldu

## 6. Acik Kapilar / Yapilacaklar

### Visual Timeline Editor
- Remotion Studio gibi Sequence'lerin gorsel temsili (hangi Sequence ne zaman aktif)
- Gallery UI'a timeline bar eklenmeli
- Renk kodlu bloklarla gorsellestirilmeli

### 3D Pipeline (r3f) ✅ TAMAMLANDI
- r3f + drei + postprocessing entegre edildi (2026-02-10)
- FramixCanvas wrapper: `src/three.tsx`
- Demo template: `src/templates/ThreeDemo.tsx` (TorusKnot, bloom, particles)
- CSS scale sorunu cozuldu (bkz. Lesson 5)
- Sonraki adimlar: kart flip, depth-of-field, particle text

### Ortak Asset Sistemi
- Template'ler arasi paylasilan logolar, fontlar
- `public/brands/` + merkezi logo registry
