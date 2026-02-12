# OC-VMP (OpenClaw Visual Management Platform)

OC-VMP is a visual dashboard designed for the [OpenClaw](https://github.com/openclaw/openclaw) ecosystem. It provides a real-time, web-based interface to manage, monitor, and visualize multiple Agent projects within an OpenClaw workspace.

---

## 💡 設計初衷 (Design Philosophy)

**「讓 AI 從黑盒子，變為看得見的團隊。」**

在傳統的 AI 互動中，使用者往往只能面對一個空白的對話框，所有的邏輯、進度與產出都隱藏在後台。OC-VMP 的誕生是為了解決以下痛點：
1. **消除黑盒焦慮**：透過「思考指示燈」，讓使用者知道 Agent 正在努力工作，而不是死機。
2. **具象化團隊感**：將不同的 Agent 任務模組化，讓使用者像管理實體辦公室一樣管理 AI。
3. **數據即時透明**：不再需要翻閱冗長的日誌，透過進度條與看板，一眼掌控全局。

---

## 📖 使用說明 (User Manual)

### 1. 全景看板 (Project Dashboard)
- **怎麼用**：這是您的「CEO 視角」。您可以在這裡看到目前所有的項目清單。
- **看什麼**：關注「Progress」進度條。如果一個項目是 100%，代表任務已圓滿達成。

### 2. 任務看板 (Kanban)
- **怎麼用**：查看 AI 具體在忙什麼。
- **看什麼**：看任務卡片如何從「待處理」移動到「已完成」。這是 AI 自動拆解邏輯的體現。

### 3. 文件預覽 (Explorer)
- **怎麼用**：直接閱讀 AI 寫給您的報告或代碼。
- **看什麼**：點選 `.md` 檔案，您會看到排版精美的專業財報或計畫書，無需下載檔案。

### 4. 通訊中心 (Comm Center)
- **怎麼用**：回顧您與 AI 之間的決策過程。
- **看什麼**：這裡記錄了重要的指令與回報，幫助您隨時找回「對話脈絡」。

---

## 🚀 Key Features

- **Project Dashboard**: A unified overview of all projects in your workspace.
- **Kanban Board**: Automatically parses `todo.md` files into a visual board.
- **File Explorer**: Browse and preview project files with Markdown rendering.
- **Comm Center**: Visualized dialogue history.
- **Automation Monitor**: Real-time status tracking of `cron` jobs.
- **Thinking State**: Visual pulse indicator for Agent activity.

## 🛠️ Tech Stack

- **Backend**: Python (Aggregator), Node.js (Server).
- **Frontend**: Vanilla JS, HTML5, CSS3 (Dark Theme, Responsive).

## 📦 Installation & Usage

1. **Clone the Repo** into your OpenClaw workspace.
2. **Scan the Workspace**: `python3 src/aggregator.py`
3. **Start the Server**: `node server.js`
4. **Access the UI**: Open `http://localhost:8001`.

## 🔒 Privacy & Security

This open-source version is decoupled from personal data.
- Dialogue: `data/dialogue.jsonl`
- Global State: `data/global_state.json`

## 📄 License

MIT License.
