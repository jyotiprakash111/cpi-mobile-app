# Cost Plus, Inc. (CPI) — Mobile Site Commissioning App

> **Offline-First Field Capture, Dynamic Schema Architecture & Photo Evidence Suite for Rural Solar Commissioning**  
> Built with **React Native**, **Expo (SDK 57)**, **TypeScript**, and **AsyncStorage**.

---

## 🚀 Quick Start & How to Run

### 1. Run on Web (Instant Browser Preview)
```bash
cd cpi-mobile-app
npm run web
```

### 2. Run on iOS Simulator / Android Emulator / Expo Go
```bash
cd cpi-mobile-app
npx expo start
```
- Press **`w`** for Web Browser
- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator
- Scan the terminal QR code with **Expo Go** on your device.

### 3. Install Prebuilt Android APK
A standalone debug APK is prebuilt and ready in the project:
* **File:** [`build/cpi-mobile-app-debug.apk`](file:///Users/apple/Downloads/CPI/build/cpi-mobile-app-debug.apk)
* **Install via ADB:**
  ```bash
  adb install -r ../build/cpi-mobile-app-debug.apk
  ```

### 4. Run Automated Form Engine Test Suite
```bash
npx tsx scripts/test-form-engine.ts
```
*(Runs 19 automated tests validating date ordering, future date prevention, dynamic photo slot generation, repeater units, and PV capacity formula arithmetic).*

---

## 📖 App Usage & User Guide

### 1. Animated Splash Screen (`costplusinc.`)
- On startup, the custom animated **`costplusinc.`** splash screen displays glowing dual-tone typography, a pulsing solar crest, and an initialization status indicator.
- Automatically transitions into the commissioning form (or tap anywhere to skip).

### 2. Section A: Construction Milestones
- Enter **Contractor Mobilised Date**, **Foundation Start Date**, and **Foundation End Date**.
- The form enforces strict chronological sequencing (`Mobilised <= Foundation Start <= Foundation End`) and blocks future dates.

### 3. Section B: Utility Installation & Electrical Tests
- **Earthing Works:** Toggle `Yes` to select Earthing Type (*Chemical* or *Pipe*) and set Earthing Point count ($1..10$).
  * *Setting Earthing Points dynamically generates corresponding photo slots in Section C (EP1, EP2...).*
- **Energy Storage System (ESS):** Specify unit count to configure individual battery unit make/model repeaters.
- **Solar PV Capacity:** Select panel wattage (e.g., $580\text{ Wp}$) and panel count ($20$) to view live computed capacity ($11.60\text{ kWp}$).

### 4. Section C: Photo Evidence Capture
- Each photo slot features a prominent **Tap to Capture Evidence** target and direct quick-action buttons:
  * 📸 **Take Photo:** Launches native device camera to click live photos.
  * 🖼️ **Gallery:** Opens device media library to pick photos.
  * ⚡ **Stamp:** Generates an instant simulated capture with ISO timestamp (for fast offline test logging).
- Once captured, slot status turns green (**`CAPTURED`**) with options to **View**, **Retake**, or **Clear**.

### 5. High-Contrast Sunlight Mode (`☀️`)
- Tap the Sun/Moon icon in the header to switch to high-contrast sunlight mode with bold black outlines for rooftop readability.

### 6. Live Schema Manager (`</>`)
- Tap the `</>` icon in the header to open the interactive schema editor. Test pushing dynamic field updates without rebuilding the app.

### 7. Finalization & Submission History
- Once all required fields and photo slots are complete, tap **Mark Complete** to view the audit review modal and save to local storage.
- Tap the history icon in the header to view and inspect all past submission records.

---

## 🏗️ Architecture: How the Form is Structured & Why

### 1. Pure Declarative JSON Schema (`src/schema/defaultSchema.json`)
The commissioning protocol is **100% schema-driven**. Sections, fields, labels, dropdown values, validation rules, visibility predicates, computed formulas, and required photo types are defined declaratively in JSON:
- **`sections`**: Defines sections (`A: Construction`, `B: Utility Installation`, `C: Photos`).
- **`visibility`**: Expressive predicates (e.g. `earthingWorks === 'Yes'`, `ess === 'Yes'`).
- **`validation`**: Cross-field rules (`not_future`, `min_date_field` referencing other fields).
- **`computed`**: Formula definition `(panelCapacity * numberOfSolarPanels) / 1000` auto-evaluating reactively.
- **`photoGroups`**: Static and dynamic photo slot generators (e.g. `EarthingNos` generating `EP1..EPn`).

### 2. Why this Architecture was Chosen
- **Rural Cooperative Agility**: As Philippine electric cooperatives (e.g. PALECO, FIBECO, MORE Power) update their commissioning standards (e.g., introducing 650Wp bifacial panels, requiring inverter disconnect photos, or tracking battery temperature), the app consumes updated schemas **without requiring a new app store binary release**.
- **100% Offline Cold-Start Guarantee**: The active schema is cached locally in `AsyncStorage` and falls back to a bundled baseline schema. The entire app functions seamlessly in airplane mode with zero network dependency.
- **Separation of Concerns**: UI components (`FieldRenderer`, `DatePickerField`, `PhotoSlotCard`) are generic presentation components; all logic is governed by the reactive `formEngine`.

---

## 💡 Verbal Close (Production at 26,000+ Units)

> *"In production this runs at 26,000+ units with photos captured on installers’ phones in low-connectivity areas. What would you change so most of these errors never occur in the first place?"*

### Solution Strategy:
1. **Schema-Driven Field Validation at Point of Capture**: Disallow manual free-form typing. Use pre-loaded offline master manifests so installers select the beneficiary from a cached list or scan a QR code on the IAS sheet.
2. **Guided In-App Camera with Slot Metadata Embedding**: Instead of loose gallery photo uploads, enforce in-app camera capture where the app watermarks and embeds EXIF metadata (GPS coordinates, IAS number, timestamp, slot tag like `EP1`) directly into the image binary.
3. **Local Perceptual Hash Duplicate Prevention**: Compute perceptual image hashes (pHash/dHash) locally on the phone at capture time to warn the installer immediately if they attempt to photograph the same foundation or serial number twice.
4. **Resilient Background Sync Queue**: Package the completed form, cryptographic photo hashes, and audit log into an encrypted, compressed archive that syncs automatically via background worker once connectivity (cellular or Wi-Fi at base camp) is detected.
