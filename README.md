# AEGIS: AI Security Layer for Digital Commerce

> **"See the threat. Understand the risk. Shop with confidence."**

AEGIS is an autonomous consumer cyber-defense platform designed to detect potential e-commerce scams, price manipulation, suspicious sellers, review rings, and off-platform payment lures on digital storefronts (such as Amazon and Flipkart) in real time.

---

## Key Features

1. **Explicit Permission & Ethical Inspection**
   - AEGIS inspects pages **only** after explicit user permission.
   - Operates strictly on client-side, user-visible DOM metadata.
   - Zero access to passwords, OTP tokens, cookies, banking credentials, or checkout flows.

2. **Multimodal Hybrid AI Threat Engine**
   - **Price Anomaly Detection**: Category baselines and extreme markdown detection.
   - **Seller Risk Analysis**: Merchant tenure, public rating distributions, and restrictive return traps.
   - **Review Intelligence**: Tri-gram Jaccard similarity and sentiment-rating dissonance metrics.
   - **Description Analysis**: NLP scans for false guarantees, artificial scarcity, and contradictory specs.
   - **Authenticity & Brand Typosquatting**: Deceptive lookalike mark detection ("App1e", "Samsvng").
   - **Scam Language Intercept**: Trapping WhatsApp diversions, direct UPI solicitations, and phishing refund links.

3. **3D WebGL Threat Telemetry (AEGIS Core)**
   - Futuristic 3D shield geometry built with Three.js / WebGL.
   - Dynamic scanning rings, neural network nodes, and data streams reacting to real-time risk scores.
   - Accessible 2D fallback mode with `prefers-reduced-motion` compliance.

4. **Chromium Manifest V3 Browser Extension**
   - Modular Site Adapters (`AmazonAdapter`, `FlipkartAdapter`, `GenericCommerceAdapter`).
   - Non-intrusive in-page floating 3D HUD overlay.
   - Automatic scanning on authorized domains.

5. **Exhibition & Judges 3-Minute Showcase Hub**
   - 6 pre-configured synthetic e-commerce listing scenarios.
   - Comprehensive multi-listing comparison matrix.
   - Model evaluation dashboard featuring real classification metrics (Accuracy, Precision, Recall, F1).

---

## Architecture Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Three.js, Lucide Icons.
- **Backend**: Express + Vite full-stack server (with matching Python FastAPI reference implementation in `/backend`).
- **Browser Extension**: Chromium Manifest V3 (`/extension`).
- **Machine Learning**: Scikit-learn TF-IDF + Linear Support Vector Machine (`/ml`).
- **Database**: PostgreSQL relational schema specification (`/backend/models.py`) with persistent session store.

---

## Quickstart & Execution Commands

### 1. Development (Web & API Server)
```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Loading the Browser Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `/extension` directory from this repository.
4. Visit any Amazon or Flipkart product listing to see the AEGIS floating badge!

### 3. Running with Docker Compose
```bash
docker compose up --build
```

### 4. Running Python FastAPI Backend (Optional Alternative)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 5. Running Machine Learning Model Training
```bash
cd ml
python train_model.py
```
