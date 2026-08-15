# The Simpsons: The Essential Cut - Stremio Add-on

A lightweight, dedicated Stremio Add-on that curates the **150 essential golden-era episodes** of *The Simpsons* across Seasons 1 to 14. 

Each episode metadata entry is compiled directly from Cinemeta to preserve official IMDb IDs (`tt0096697:s:e`), ensuring seamless compatibility with all Stremio stream providers (Torrentio, Cinemeta, CyberFlix, etc.).

---

## Features
- **100% Curated Golden-Era Catalog:** Seasons 1 through 14 essential episodes with zero filler.
- **Accurate IMDb Mapping:** Matched dynamically against Stremio's Cinemeta API.
- **Instant Stream Resolution:** Full compatibility with Stremio's stream resolvers.
- **Cloud Ready:** Optimized for zero-cost deployment on Render.com.

---

## Project Structure
```
simpsons-essential-addon/
├── build-dataset.js    # Script to query Cinemeta and compile dataset.json
├── dataset.json        # Compiled 150 essential episodes metadata
├── server.js           # Stremio Add-on HTTP server (SDK)
├── package.json        # Node dependencies and scripts
└── README.md           # Deployment and installation guide
```

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Rebuild Dataset
To re-fetch and compile the dataset from Cinemeta:
```bash
npm run build:dataset
```

### 3. Start Add-on Locally
```bash
npm start
```
The server will start at `http://127.0.0.1:7000`. You can verify your manifest at `http://127.0.0.1:7000/manifest.json`.

---

## Deployment to Render.com (Step-by-Step)

You can host this add-on for free on [Render](https://render.com/).

### Step 1: Push Project to GitHub
1. Create a new repository on GitHub (or use your existing repository).
2. Commit the `simpsons-essential-addon` directory:
   ```bash
   git add .
   git commit -m "Add The Simpsons Essential Cut Stremio Add-on"
   git push origin main
   ```

### Step 2: Create a Web Service on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name:** `simpsons-essential-addon` (or your preferred name)
   - **Root Directory:** `simpsons-essential-addon` (if deployed from a monorepo, otherwise leave blank if it's the root of its own repo)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Create Web Service**.

> [!NOTE]
> **Free Tier Sleep Behavior:** On Render's Free Tier, services spin down after 15 minutes of inactivity. When accessed after inactivity, the service takes approximately **50 seconds to spin up**. This is standard and expected behavior.

---

## Installing the Add-on in Stremio

Once your Render Web Service has deployed:

1. Copy the generated URL of your Render Web Service (e.g., `https://simpsons-essential-addon.onrender.com`).
2. Append `/manifest.json` to the URL:
   ```
   https://simpsons-essential-addon.onrender.com/manifest.json
   ```
3. Open **Stremio** (Desktop, Mobile, Android TV, or Web at [web.strem.io](https://web.strem.io)).
4. Go to **Addons** (puzzle piece icon).
5. Paste the full manifest URL into the search bar / addon URL input box and click **Install**.
6. The curated series **The Simpsons (The Essential Cut)** will now appear in your Stremio Series Catalog and Search!
