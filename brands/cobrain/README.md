# Cobrain

AI asistan platformu. Turkiye merkezli, kisisel ve is uretkenligine odakli.

## Hakkinda

Cobrain, yapay zeka destekli kisisel asistan. Gunluk gorevleri otomatiklestirme, arastirma, icerik uretimi ve is akisi yonetimi icin tasarlandi.

## Brand Identity

### Ton & Ses
- Profesyonel ama samimi
- Teknik ama anlasilir
- Turkce oncelikli, teknik terimler Ingilizce

### Hedef Kitle
- Bireysel kullanicilar (uretkenlik)
- KOBi'ler (is otomasyonu)
- Teknik profesyoneller

## Renk Paleti

| Rol | Hex | Kullanim |
|-----|-----|----------|
| **Primary** | `#8b5cf6` | Ana mor — logo, basliklar, CTA butonlari |
| **Primary Light** | `#a78bfa` | Hover state, secondary accent |
| **Primary Dark** | `#6d28d9` | Active state, gradient bitis |
| **Background** | `#0a0a0a` | Ana arka plan |
| **Surface** | `#111111` | Kart, panel arka plani |
| **Surface Elevated** | `#1a1a1a` | Modal, dropdown |
| **Text Primary** | `#f5f5f5` | Ana metin |
| **Text Secondary** | `#8b8b8b` | Alt yazi, aciklama |
| **Text Muted** | `rgba(255,255,255,0.5)` | Brand text, watermark |
| **Accent Blue** | `#3b82f6` | AI, teknoloji vurgusu |
| **Accent Green** | `#22c55e` | Basari, onay |
| **Accent Red** | `#e53e3e` | Hata, dikkat |
| **Glow** | `rgba(139,92,246,0.15)` | Arka plan glow efekti |

### Gradient
```css
/* Primary gradient */
linear-gradient(135deg, #8b5cf6, #6d28d9)

/* Subtle background glow */
radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)
```

## Tipografi

| Rol | Font | Weight | Size |
|-----|------|--------|------|
| **Baslik** | Inter | 800-900 | 36-120px |
| **Alt baslik** | Inter | 500-600 | 24-32px |
| **Body** | Inter | 400 | 16-18px |
| **Monospace** | JetBrains Mono | 400 | 12-14px |
| **Brand text** | Inter | 600 | 28px |

- Letter spacing: basliklar `-0.02em`, tracked text `0.04-0.15em`
- Brand text ("cobrain") her zaman kucuk harf

## Logo Kullanimi

- **Dosya**: `assets/logo.png` (1024x1024, RGB)
- **Video icinde**: 56px daire (border-radius: 50%)
- **Yani metin**: "cobrain" — 28px, Inter 600, `rgba(255,255,255,0.5)`
- **Konum**: Kapanista ekran ortasi, logo + text yan yana, gap: 18px

### Kapanis Animasyonu
```
Frame 0-15:  Color streak (onceki kartlarin renkleri, soldan saga)
Frame 10-50: Logo fade-in + translateY(20→0) spring animasyon
Son 15 frame: Tum sahne fade-out
```

## Template'ler

Bu marka icin olusturulan template'ler:
- `CobrainPromo` — 15 saniyelik ses senkronlu promosyon
- `AITimeline` / `AITimelineGSAP` / `AITimelineV2` — AI haber timeline'i, cobrain branding kapanisli

## Notlar

- Outro her zaman minimal — sadece logo + "cobrain" text
- "AI is everywhere" gibi impact text KULLANMA
- Kapanista kart renklerinden color streak gecisi hosuna gidiyor
