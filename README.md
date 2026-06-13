# 📈 Alpha Quant Trading Hub Terminal

A real-time, event-driven **Quantitative Algorithmic Trading Desk Working HUD** engineered with an asynchronous decoupled architecture. The terminal acts as an active financial workstation streaming live multi-asset metrics, calculating running lot positions with live P&L variations, and rendering machine intelligence directive streams.

---

## 🏗️ System Architecture & Data Pipeline

The application features a non-blocking ingestion layer, a high-frequency parsing mechanism, and a fluid client-side viewport module.


### 1. Reactive Core Stream Hub
* **Framework Layer:** Built utilizing reactive asynchronous paradigms to handle high-frequency pricing updates without stalling event loops.
* **Network Protocol:** Driven by **Server-Sent Events (SSE)** via a persistent connection pipe, pushing unidirectional payload frames from the server directly to the subscriber view model.

### 2. Generative Strategy Inference Node
* **Processor Context:** Connected directly to a **Llama 3.3 (70B parameter)** engine operating over ultra-low latency **Groq network infrastructure**.
* **Alpha Generation:** Continually evaluates ongoing price metrics and volatility ratios to generate natural language target directives and trade execution parameters.

### 3. Front-End Analytical HUD Workspace
* **Tooling & Compilation:** Initialized via **Vite** over **React** for lightning-fast hot-module reloading and optimized static asset packaging.
* **State Syncing:** Tracks multi-key arrays utilizing performance-tuned React lifecycle loops to ensure zero frame-drops during active data bursts.

---

## 💎 Key Operational Features

* **🗂️ Multi-Asset Watchlist Arrays:** Includes an interactive sidebar system enabling instantaneous toggling across **BTC/USD**, **ETH/USD**, and **SOL/USD** assets to update localized contextual tracking points.
* **⚡ Live Fallback Simulator:** Includes an internal continuous micro-fluctuation macro loop to safely simulate market movements and check component computations if the local network infrastructure falls offline.
* **💼 Mock Execution Desk:** A sandbox transaction matrix allowing the trader to input specified order sizes to `BUY` or `SELL` active instruments.
* **📊 Live P&L Bookkeeping:** Initializes a virtual starting wallet tracking $100,000 USD, computing shifting account balances, processing running weighted average cost bases, and logging unrealized Profit & Loss (P&L) live as prices change.

---

## 🎨 Professional User Interface Styling
* **Obsidian Palette Canvas:** Styled explicitly with custom deep-navy dark overlays (`#070b19`) to drastically reduce visual fatigue over extended market monitoring sessions.
* **Color-Coded Status Badges:** Implements interactive visual states (emerald indicators for active streaming links, red indicators for simulation fail-safes) to keep track of network health in under a second.
* **Low-Level Terminal Console Shell:** Mirrors physical market computing configurations by framing AI intelligence vectors inside a low-level diagnostic console design.

---

## 🚀 Getting Started Locally

### 1. Clone and Install Dependencies
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd crypto-dashboard
npm install