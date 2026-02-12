# OC-VMP (OpenClaw Visual Management Platform)

OC-VMP is a visual dashboard designed for the [OpenClaw](https://github.com/openclaw/openclaw) ecosystem. It provides a real-time, web-based interface to manage, monitor, and visualize multiple Agent projects within an OpenClaw workspace.

## 🚀 Key Features

- **Project Dashboard**: A unified overview of all projects in your workspace, including status, progress, and project markers.
- **Kanban Board**: Automatically parses project `todo.md` files into a visual Kanban board (To-Do, In Progress, Done).
- **File Explorer**: Browse and preview project files (Code, Markdown, JSON) directly in the browser with Markdown rendering support.
- **Comm Center**: A visualized dialogue history between the user and the Agents.
- **Automation Monitor**: Real-time status tracking of OpenClaw `cron` jobs and scheduled tasks.
- **Thinking State**: Visual pulse indicator showing when your Agent is processing or "thinking".

## 🛠️ Tech Stack

- **Backend**: Python (Data Aggregator), Node.js (Static Server).
- **Frontend**: Vanilla JS, HTML5, CSS3 (Dark Theme, Responsive/Mobile-friendly).
- **Engine**: [Marked.js](https://github.com/markedjs/marked) for Markdown rendering.

## 📦 Installation & Usage

1. **Clone the Repo** (or move these files into your OpenClaw workspace).
2. **Scan the Workspace**:
   ```bash
   python3 src/aggregator.py
   ```
3. **Start the Server**:
   ```bash
   node server.js
   ```
4. **Access the UI**:
   Open `http://localhost:8001` in your browser.

## 🔒 Privacy & Security

This open-source version is decoupled from personal data. To use it with your own data:
- Dialogue records are stored in `data/dialogue.jsonl`.
- Global state is aggregated into `data/global_state.json`.
- Personal financial data should be managed via separate projects (see [OpenClaw skills](https://clawhub.com)).

## 📄 License

MIT License. Feel free to use and contribute.
