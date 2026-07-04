# WaTTrack — Home Energy Auditor (v1.0.0)

A professional-grade, high-density, industrial-styled household energy auditing application. WaTTrack is built as a zero-dependency, local-first progressive utility designed to make energy audits accessible, clear, and highly actionable on both desktop and mobile screens.

Designed with pride by **Idnafen**.

---

## 🌍 Production Live Link

WaTTrack is fully deployed and public on Netlify!

🚀 **Access the application live:**
* Primary Link: [https://wattrack.netlify.app](https://wattrack.netlify.app)
---

## 🚀 Concept & Key Features

WaTTrack eliminates complex setup requirements, local databases, or external logins. It offers an instant-entry environment that runs immediately on any browser or mobile screen with zero prerequisites:

- **Audit Designation Registry**: Create, manage, and toggle property energy audits. Perfect for auditing your main home, secondary units, or keeping track of multiple customer sites.
- **Instant Mobile Access (QR Sync)**: Scan the generated live QR code directly on screen. The responsive viewport fits perfectly on smaller devices. You can add it directly to your home screen with zero installation.
- **Hardware Appliance Input**: Custom input panel with built-in presets (Kitchen, HVAC, Lighting, Entertainment, Office, Laundry) to quickly register and audit household devices.
- **Energy Allocation Breakdown**: Color-coded, industrial donut chart with custom hover stats providing a clean visual footprint of your energy allocation.
- **Critical Power Rankings**: Visual ranking bar chart of the top five power-consuming devices to help isolate baseline utility hogs.
- **Interactive Upgrade Simulator**: Interactive simulation model allowing you to toggle LED retrofits, smart thermostat installations, or standby vampire leakage shutoffs to instantly calculate potential annual utility and physical (kWh) savings.
- **Industrial PDF Export**: Print or save ready-to-use, professional physical reports of your active registers in one click.

---

## 📐 Precise Energy Formulas

WaTTrack calculates active hardware load factors with standard thermodynamic and electric equations:

$$\text{Daily Watt-hours (Wh)} = \text{Power (Watts)} \times \text{Hours Per Day} \times \text{Quantity}$$

$$\text{Daily Kilowatt-hours (kWh)} = \frac{\text{Wh}}{1000}$$

$$\text{Annual Cost} = \text{Daily kWh} \times 365 \times \text{Tariff Rate (per kWh)}$$

---

## 📱 Mobile-First Native Experience

To run WaTTrack on your phone without installing bulky software packages or satisfying complex system prerequisites:
1. Tap the **MOBILE ACCESS** button in the header bar.
2. Scan the dynamic QR code with your mobile camera, or go directly to [https://wattrack.netlify.app](https://wattrack.netlify.app).
3. **PWA Tip**: Tap **Share > Add to Home Screen** on Safari, or **Add to Home Screen** on Android Chrome, to launch WaTTrack as a full-screen, native application directly on your phone with zero clutter!
4. **Offline Persistence**: Your audits and modifications are stored safely using local browser storage, allowing you to audit offline on site.

---

## 🎨 Aesthetic Guidelines

Designed with a high-density, professional **Industrial Slate Theme**:
- **Typography**: Display headings in modern, geometric *Space Grotesk* paired with code structures and metadata lists in *JetBrains Mono*.
- **Color Palette**: Pristine, high-contrast, paper-like backgrounds (`#E4E3E0`, `#DEDEDB`, `#141414`) that prevent screen fatigue and replicate technical physical paper worksheets.
- **Layout Precision**: Flat, sharp borders with no visual distraction, placing the utility as the absolute priority of the user workspace.

---

## 📦 Local Development

WaTTrack runs natively on Node.js using modern React with Vite.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Launch Developer Server**:
   ```bash
   npm run dev
   ```
   *Runs by default on port `3000` internally with direct live-preview proxy access.*

3. **Build Static Bundle**:
   ```bash
   npm run build
   ```

---

*WaTTrack - Tracking Watts, Auditing Spaces, Saving Energy.*
