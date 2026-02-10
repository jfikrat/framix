# Framix — Project Instructions

@.claude/lessons-learned.md
@brands/cobrain/README.md

## Project Overview

Programmatik video animasyon platformu. React component'leri ile animasyon yaz, browser'da preview et, Puppeteer + FFmpeg ile MP4'e render et.

## Tech Stack

- **Runtime**: Bun (ASLA npm/yarn/pnpm kullanma)
- **Frontend**: React 19 + TypeScript + Vite
- **Animasyon**: interpolate/spring (dahili) + GSAP (karmasik timeline'lar icin)
- **Rendering**: Puppeteer (headless Chrome) + FFmpeg
- **Dev server**: `bun run dev` (port 4200)
- **API server**: `bun run server` (port 3333)

## Architecture

```
src/
├── animations.ts        # interpolate, spring, easing, VideoConfig, presets
├── Sequence.tsx          # FrameProvider, useCurrentFrame, useVideoConfig, Sequence
├── gsap.ts              # useTimeline, useStagger (paused GSAP, seek ile sync)
├── three.tsx            # FramixCanvas wrapper (r3f + drei + postprocessing)
├── Player.tsx           # Preview player (FrameProvider ile sarar)
├── Gallery.tsx          # Project galeri UI (Vite glob ile auto-discovery, brand gruplama)
├── audio/               # Ses motoru (stereo, reverb, compressor)
├── templates/
│   ├── types.ts         # ProjectMeta, TimelineSegment interfaces
│   ├── index.ts         # Export registry (eski, Gallery artik glob kullaniyor)
│   └── *.tsx            # Her proje: meta + component + templateConfig + timeline?
└── components/          # Ortak UI bilesenler

brands/                   # Marka/musteri bilgi bankasi
├── _template/            # Yeni marka eklerken kopyala
│   ├── README.md         # Brand guide sablonu
│   ├── palette.json      # Renk paleti sablonu
│   └── assets/           # Logo, banner, font dosyalari
├── cobrain/              # Cobrain AI asistan
│   ├── README.md         # Brand guide (renkler, tipografi, ton, logo kullanimi)
│   ├── palette.json      # Machine-readable renk paleti
│   └── assets/
│       └── logo.png      # 1024x1024 logo
└── [yeni-marka]/         # _template'i kopyala, doldur
```

## Brand Sistemi

Yeni marka eklemek icin:
1. `brands/_template/` klasorunu kopyala: `cp -r brands/_template brands/yeni-marka`
2. `README.md` ve `palette.json` icini doldur
3. Logo/asset'leri `assets/` klasorune koy
4. Template'lerde kullanilacak asset'leri `public/brands/yeni-marka/` altina da koy
5. CLAUDE.md'ye `@brands/yeni-marka/README.md` referansi ekle

Template yazarken marka bilgilerine `brands/MARKA/README.md` ve `palette.json`'dan bak.

## Project Sistemi

Her proje dosyasi su export'lari icermeli:
- `meta: ProjectMeta` — id, name, brand?, category, color (ZORUNLU)
- Named component: `React.FC<AnimationProps>` — frame ve config alir
- `templateConfig?: Partial<VideoConfig>` — custom resolution/fps/duration
- `timeline?: TimelineSegment[]` — sequencer bar icin segment bilgisi (opsiyonel)

Gallery `import.meta.glob("./templates/*.tsx")` ile otomatik kesfeder. index.ts'ye eklemeye gerek yok.
Projeler sidebar'da `brand` field'ina gore gruplanir (cobrain, genel vb.).

## Animasyon Primitifleri

### interpolate(value, inputRange, outputRange, options?)
- Basit A→B gecisler icin
- `easing` parametresi destekler: `easing.easeOutCubic`, `easing.elastic` vb.
- Default clamp: true

### spring({ frame, fps, damping?, stiffness?, mass? })
- Fizik tabanli bouncy animasyon
- Giris animasyonlari icin ideal
- 0→1 arasi deger dondurur

### Sequence (from?, durationInFrames)
- Time slicing — children sadece belirtilen frame araliginda render olur
- Children `useCurrentFrame()` ile LOCAL frame alir (0'dan baslar)
- Nested Sequence destekler

### GSAP useTimeline / useStagger
- Karmasik multi-step animasyonlar icin
- GSAP paused timeline olusturur, seek(frame/fps) ile sync eder
- ASLA DOM'a dokunmaz — plain JS object animate eder

## Conventions

- Build check: `bun run build` (vite build)
- Lint yoksa build yeterli
- Proje isimleri PascalCase: `AITimelineV2`, `CobrainPromo`
- Proje ID'ler kebab-case: `ai-timeline-v2`, `cobrain-promo`
- Renk degerleri hex: `#8b5cf6`, `#e53e3e`

## Coding Rules

- Yeni proje icin mevcut bir projeyi referans al (AITimelineV2 en guncel)
- interpolate + spring basit animasyonlar icin yeterli, GSAP sadece karmasik timeline gerektiginde
- SVG logolar icin simple-icons paketinden path data cek
- Public asset'ler `public/` klasorunde
- FrameProvider Player'da HEM fullscreen HEM normal modda olmali
- 3D animasyonlar icin r3f (React Three Fiber) + drei + postprocessing kullan
- r3f Canvas icinde useCurrentFrame() CALISMAZ — frame/config'i prop olarak gec
- Canvas: preserveDrawingBuffer: true (Puppeteer render icin zorunlu)
- FramixCanvas wrapper'ini kullan (src/three.tsx)

---

## Fekrat'in Tercihleri

### Tasarim Stili
- **Koyu arka plan** tercih eder — `#0a0a0a`, `#111111`, koyu tonlar
- **Accent glow** sever — kartın rengine gore arka plan hafifce degisir
- **Minimal outro** — sadece branding, kalabalik text yok
- **Gercekci logolar** — emoji DEGIL, SVG marka logolari veya ozenli monogramlar
- **Scanline / film grain** gibi subtle overlay efektler hosuna gidiyor
- **Progress bar** altta ince cizgi olarak

### Animasyon Stili
- **Spring physics** sever — bouncy ama kontrollü (damping 8-15)
- **Perspective rotateY** kart girisleri hosuna gidiyor
- **Stagger** animasyonlar — elemanlar sirali girsin
- **Hizli giris, yavas cikis** — easeOutCubic giris, easeInCubic cikis
- **Pulse efekti** — ikonlarin hafifce buyuyup kuculmesi

### Renk Paleti (begendigi)
- Mavi: `#3b82f6` (AI, tech)
- Kirmizi: `#e53e3e`, `#FF0050` (TikTok, aksiyon)
- Altin: `#D4AF37` (premium, Goldman)
- Yesil: `#22c55e`, `#00C851` (aksiyon butonlari)
- Mor: `#8b5cf6` (project accent, branding)
- Turuncu: `#FF6B00` (enerji, Grok)

### Yapisal Tercihler
- **Dinamik sure** — kart/icerik sayisina gore otomatik hesaplanan duration
- **Sequence mimarisi** — her sahne kendi Sequence'inde, local frame ile
- **Dot indicator** — kartlar arasi ilerleme gostergesi
- **Frame counter** — sag altta kucuk, `FR 080/415` formati
- **Cobrain branding** — kapanislarda logo + "cobrain" text, subtle

### Begenmedikleri
- Emoji ikonlar (profesyonel degil)
- Kalabalik outro text ("AI is everywhere" gibi impact text'ler)
- Hardcoded sureler (kart eklediginde sureyi manuel guncellemek)
- Remotion bagimliligini projeye tasinak (kendi framework'u varken)
