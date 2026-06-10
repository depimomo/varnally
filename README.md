# 🌸 Varnally

> **An advanced, AI-powered Personal Color Analysis and Facial Geometry assistant.** Determine your perfect seasonal color palette, classify your facial architecture, virtually simulate recommended cosmetics, and analyze wardrobe color compatibility using modern multi-modal vision intelligence.

---

## ✨ Overview

**Varnally** is a dual-language (English and Indonesian / *Varna*) full-stack application designed to give users a high-end, studio-grade personal color analysis and facial geometric consultation directly from a single photo. 

Traditional custom draping sessions and facial typing are expensive and hard to access. Varnally solves this by leveraging **Google Gemini Multi-modal Vision models** alongside custom canvas algorithms to perform immediate, precision assessments. Best of all, it keeps your data responsive and secure by synchronizing your session history from seamless client-side storage to persistent cloud databases.

---

## 🎨 Core Features

### 1. AI Personal Color Analysis & Geometric Typing
* **Precision Vision Models**: Processes high-resolution close-ups to determine skin undertones, eye color, hair tone, jewelry affinity (Gold, Silver, or Mixed), and matches them with one of the **12 Master Seasonal Archetypes**.
* **Facial Architecture Analysis**: Detects facial geometric ratios (Oval, Round, Square, Heart, Oblong, Diamond) and delivers descriptive guidance, recommended eyewear models, and style suggestions.
* **Dynamic Color Draping**: Allows users to interactively overlay digital color swatches on top of their uploaded image, providing real-time visual validation of their optimal seasonal palette compared to colors to avoid.

### 2. 💄 GlowMeUp (Virtual Try-on & Makeup recommendation)
* **Custom Color Swatches**: Recommends color coordinates for lips, eyeshadow, blush, and highlighter that match the user's seasonal profile.
* **Interactive Compare Slider**: Implements an overlay slider using CSS clip-paths so users can drag a divider line to compare their natural face directly side-by-side with the cosmetic simulation.
* **Auto-Adaptive Mockups**: Includes realistic sample profiles for cold starts or API limit situations so users can explore and test presets immediately.

### 3. 🧥 StylizeMe (Outfit Compatibility Analyzer)
* **Wardrobe Match Engine**: Users can upload multiple clothing photos or pick from style samples.
* **Color Compatibility Assessment**: Extracts the dominant color hues and scores how well they harmonize with the user's analyzed seasonal profile.
* **Status Indicators**: Flags each clothing item with scannable labels (e.g., *Recommended/Compatible* vs *Not Ideal*) with matching design gradients.

### 4. 🔗 Hybrid Local-to-Cloud Synchronization
* **Google authentication**: Simple authentication using Firebase Auth (Google Popup Provider).
* **Automatic Offline Storage**: Unregistered user analyses are automatically queued in modern `localStorage`.
* **Safe Sync Engine**: Once the user logs in, Varnally immediately transfers local profiles to high-durability cloud persistence (Firebase Firestore), preserving the active profile selections without payload duplication.

### 5. 🖨️ Shareable Poster Generator
* **Export-Ready Design cards**: Uses `html2canvas` to render beautiful, polished, and shareable high-contrast physical summaries showing your seasonal archetype, best color palette, skin undertones, and face type in a single printable poster.

---

## 🛠️ Tech Stack & Architecture

### **Frontend & Interface**
* **Framework**: React 19 & Vite 6 (Single-Page Application architecture)
* **Language**: TypeScript (Strict type enforcement)
* **Styling**: Tailwind CSS v4 (Sleek, utility-first design with custom high-contrast palettes)
* **Animation**: Motion (`motion/react` for card flips, route enters, fluid dropdown expansions, and bento shifts)
* **Icons**: `lucide-react`

### **AI Services**
* **Model Orchestration**: `@google/genai` (Google GenAI TypeScript SDK)
* **Processing Models**: 
  * `gemini-3.5-flash`: Fast, structured-JSON personal color, facial geometric classification, and wardrobe analysis.
  * `gemini-2.5-flash-image`: Custom image generation and multi-modal canvas swatch overlay.

### **Persistence & Infrastructure**
* **Database & Storage**: Firebase Firestore 12 (Dynamic metadata, analysis archives, and cloud profiles)
* **Authentication**: Firebase Auth (Identity provider)
* **Canvas Processing**: Native HTML5 Canvas API (Adaptive, high-fidelity downscaling preserving aspect ratio up to 1000px, compression to `0.88` JPEG quality to ensure crisp screens on desktop while managing server bandwidth limits).

---

## 📂 File Directory Map

```bash
├── firebase-blueprint.json    # Firestore collection schema references
├── firestore.rules            # High-security read/write authorization validation
├── metadata.json              # Platform permission configurations
├── public/                    # Static mascots and visual fallback assets
└── src/
    ├── App.tsx                # Application shell, state controller, & Firebase syncing logic
    ├── types.ts               # Shared TypeScript schemas and season models
    ├── main.tsx               # Client entry point
    ├── index.css              # Custom font typography imports and Tailwind setups
    ├── components/            # UI Components grouped modularly:
    │   ├── LandingHero.tsx    # Immersive visual landing introduction
    │   ├── VarnallyHub.tsx    # Sub-page navigation controller
    │   ├── GlowMeUp.tsx       # Makeup visualizer & compare slider mechanics
    │   ├── StylizeMe.tsx      # Outfit evaluator & file uploader
    │   ├── AnalysisResult.tsx # Detailed report bento grid view
    │   ├── ShareablePoster.tsx# Canvas generator card for download
    │   ├── HistoryList.tsx    # Historic query timeline & deletion list
    │   └── ImageUploader.tsx  # Drag-and-drop file uploader & camera capture controls
    ├── lib/
    │   ├── firebase.ts        # FireStore client initialization & error sanitizers
    │   └── LanguageContext.tsx# Dynamic localized hook helper
    ├── locales/               # Key-value translation catalogs
    │   ├── en.json            # English translations
    │   └── id.json            # Indonesian translations
    └── services/
        └── gemini.ts          # Structured prompt engineering & retry logic wrappers
```

---

## 🚀 Getting Started

### 1. Clone the project & Import
```bash
git clone https://github.com/your-username/varnally.git
cd varnally
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root folder based on `.env.example`:
```env
# Google GenAI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web Client Credentials
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port defined by your Vite configuration) inside your browser.

### 5. Build for Production
To bundle assets for high-performance static hosting:
```bash
npm run build
npm run preview
```

---

## 🔒 Firebase Security Guidelines

Ensure your Firestore collection rules in `firestore.rules` protect user data by only allowing authenticated creators to query/delete records:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analyses/{analysisId} {
      allow read, delete, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 🛠️ Technical Pipeline & Optimizations

* **Seamless Fallbacks**: To maintain continuous operations when AI vision quotas are saturated, Varnally integrates custom simulated analyzers and provides pre-rendered high-quality fashion models.
* **Exponential Backoff**: API integrations in `src/services/gemini.ts` include automatic retry wrappers targeting temporary `503 Unavailable` demand spikes from backend services.
* **Optimized Image Processing**: Uploaded images are adapted down to clear, light vectors using HTML5 canvas helpers prior to cloud payload caching, guaranteeing lightning-fast database performance.

---

*Made with love, design precision, and high-performance engineering.* 🌸
