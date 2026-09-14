# TeraSync: Spare Parts Visual Catalog & Identification Guide

> **Visual Identification Invariant:** In the Addis Ababa informal automotive market, mechanics and car owners frequently identify components by physical appearance, mounting patterns, bolt layouts, and connector configurations rather than obscure OEM part numbers. This catalog provides high-fidelity reference images and visual verification criteria for launch catalog parts.

---

## 1. Catalog Visual Standards

- **Background & Isolation:** All primary catalog images are shot or rendered on an isolated pure white background (`#FFFFFF`) with soft directional contact shadows.
- **Aspect Ratio & Resolution:** Standardized `1:1` square aspect ratio at minimum `1024x1024` resolution, responsive down to mobile thumbnails (`160x160`).
- **Format & Compression:** Served as next-gen WebP with progressive fallback, compressed under 180 KB for optimal performance over Ethio Telecom 3G/4G connections.
- **Visual Markers:** Each catalog part highlights 2 to 4 distinct physical inspection points (flange bolts, connector pinout, fluid ports, bracket alignment) so buyers can compare their removed defective part against the catalog picture.

---

## 2. Seed Part Assets in Repository

The generated catalog images are stored under `frontend/public/images/catalog/`:

| Part Name (EN) | Part Name (AM) | Local Nickname | Image Asset | Primary Fitment |
|----------------|----------------|----------------|-------------|-----------------|
| Diesel Fuel Injection Pump (5L) | የናፍጣ ኢንጄክሽን ፓምፕ (5L) | የናፍጣ ቦምብ / 5L ፖምፓ | `/images/catalog/toyota-hiace-5l-injection-pump.jpg` | Toyota HiAce Minibus (5L Diesel), Hilux |
| Complete Heavy-Duty Clutch Kit | የፍሪሲዮን ኪት (ሰሃን፣ ዲስክ፣ ቢያሪንግ) | ፍሪሲዮን ኪት / የክላች ዲስክ | `/images/catalog/clutch-kit-assembly.jpg` | Toyota HiAce, Hilux, Prado |
| Front Brake Caliper & Ventilated Rotor | የፊት ፍሬን ካሊፐር እና ዲስክ ሮተር | የፊት ፍሬን ካሊፐር / ፍሬን ዲስክ | `/images/catalog/brake-caliper-ventilated-rotor.jpg` | Toyota HiAce, Corolla, Hyundai Tucson |
| EV Traction Motor Inverter (MCU) | የኤሌክትሪክ መኪና ሞተር ኢንቨርተር | የኢቪ ኢንቨርተር / ሞተር ኮንትሮለር | `/images/catalog/byd-ev-motor-inverter-mcu.jpg` | BYD Atto 3, Dolphin, Song Plus, Qin Plus |
| Heavy-Duty Suspension Shock Absorber | የጋዝ አሞርቲሳሪያ (ሾክ አብሶርበር) | አሞርቲሳሪያ / የፊት-የኋላ ሾክ | `/images/catalog/heavy-duty-shock-absorber.jpg` | Toyota HiAce Minibus fleet, Hilux |
| High-Output Commercial Alternator | አልተርኔተር (የባትሪ መሙያ ዳይናሞ) | ዳይናሞ / ቻርጅ ዳይናሞ | `/images/catalog/commercial-alternator.jpg` | Toyota HiAce 5L/1KD, Hilux, Hyundai |
| EV GB/T Dual DC/AC Charging Port | የቻርጅ ማገናኛ ሶኬት (GB/T) | የቻርጅ ሶኬት / የኢቪ ፕለግ | `/images/catalog/byd-ev-gbt-charging-port.jpg` | BYD Seagull, Atto 3, Dolphin, Han |

---

## 3. Visual Search & Fitment Verification Workflow

When a customer navigates the storefront:
1. **Visual Thumbnail in Search & Category Tree:** Every part card displays its clear 1:1 image next to the title, Amharic name, and OEM reference number.
2. **Exploded Component View:** On the part detail page, the customer can zoom in to inspect port configurations, wiring harness headers, and bolt spacing.
3. **Side-by-Side Verification (Screen D - Request Offer):** When creating an offer request, the customer can photograph their old defective part from their vehicle. The interface presents the customer's photo side-by-side with the official catalog reference image, providing immediate confidence in part equivalence before dispatching notifications to merchants.
