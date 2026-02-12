document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadDashboard();
});

function initTabs() {
    const btns = document.querySelectorAll('.nav-btn');
    const contents = document.querySelectorAll('.tab-content');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${target}`).classList.add('active');
            
            if (target === 'kanban') renderKanban();
            if (target === 'explorer') renderExplorer();
            if (target === 'dialogue') renderDialogue();
            if (target === 'automation') renderAutomation();
        });
    });
}

function loadDashboard() {
    try {
        const data = window.LUMI_DATA;
        if (!data) throw new Error("No LUMI_DATA found");
        
        updateStats(data);
        renderProjects(data.projects);
        document.getElementById('last-update').textContent = `Last Scan: ${new Date(data.last_scan).toLocaleString()}`;
        
        // Handle thinking indicator
        const thinkingIndicator = document.getElementById('thinking-indicator');
        if (data.is_thinking) {
            thinkingIndicator.classList.remove('hide');
            thinkingIndicator.title = "Lumi is thinking...";
        } else {
            thinkingIndicator.classList.add('hide');
        }

        // Populate all project selectors
        const selectors = document.querySelectorAll('.p-select');
        selectors.forEach(selector => {
            const currentVal = selector.value;
            selector.innerHTML = '';
            Object.keys(data.projects).forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = data.projects[id].name;
                selector.appendChild(opt);
            });
            if (currentVal && data.projects[currentVal]) selector.value = currentVal;
            
            selector.onchange = (e) => {
                const target = e.target.dataset.target;
                if (target === 'kanban') renderKanban();
                if (target === 'explorer') renderExplorer();
            };
        });

        // Auto-render the currently active tab
        const activeTab = document.querySelector('.nav-btn.active').dataset.tab;
        if (activeTab === 'kanban') renderKanban();
        if (activeTab === 'explorer') renderExplorer();
        if (activeTab === 'dialogue') renderDialogue();
        if (activeTab === 'automation') renderAutomation();

    } catch (error) {
        console.error('Failed to load global state:', error);
    }
}

function updateStats(data) {
    document.getElementById('project-count').textContent = data.projects_count;
    const activeCount = Object.values(data.projects).filter(p => p.status === 'active').length;
    document.getElementById('active-count').textContent = activeCount;
}

function renderProjects(projects) {
    try {
        const container = document.getElementById('project-list');
        if (!container) return;
        container.innerHTML = '';
        if (!projects) return;

        const sortedIds = Object.keys(projects).sort((a, b) => a.split('/').length - b.split('/').length);

        for (const id of sortedIds) {
            const project = projects[id];
            const card = document.createElement('div');
            card.className = 'project-card';
            
            const progressParts = project.progress ? project.progress.split('/') : [0, 0];
            const done = parseInt(progressParts[0]) || 0;
            const total = parseInt(progressParts[1]) || 0;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            
            const markersHtml = (project.markers || []).map(m => `<span class="marker-tag">${m}</span>`).join('');

            card.innerHTML = `
                <div class="project-header">
                    <div class="project-name">${project.name}</div>
                    <span class="badge ${project.status || 'stable'}">${project.status || 'stable'}</span>
                </div>
                <div class="project-meta">
                    <span class="path-text">📂 ${project.rel_path}</span><br>
                    Updated: ${project.last_updated ? new Date(project.last_updated).toLocaleDateString() : 'Unknown'}
                </div>
                <div class="markers-list">${markersHtml}</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
                <div class="progress-text">Progress: ${project.progress || '0/0'} (${percent}%)</div>
            `;
            container.appendChild(card);
        }
    } catch (e) {
        console.error("Dashboard render error:", e);
    }
}

function renderKanban() {
    try {
        const data = window.LUMI_DATA;
        const selector = document.querySelector('.p-select[data-target="kanban"]');
        if (!selector) return;
        const projectId = selector.value;
        const project = data.projects[projectId];
        
        const cols = {
            'todo': document.querySelector('#col-todo .card-list'),
            'in-progress': document.querySelector('#col-in-progress .card-list'),
            'done': document.querySelector('#col-done .card-list')
        };
        
        Object.values(cols).forEach(el => el.innerHTML = '');

        if (!project || !project.tasks) return;

        project.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.innerHTML = `
                <div class="phase-tag">${task.phase}</div>
                <div class="task-title">${task.title}</div>
            `;
            
            let targetCol = task.status === 'done' ? 'done' : 'todo';
            if (task.status === 'todo' && (task.title.includes('實作') || task.title.includes('開發'))) {
                targetCol = 'in-progress';
            }
            
            if (cols[targetCol]) cols[targetCol].appendChild(card);
        });
    } catch (e) {
        console.error("Kanban render error:", e);
    }
}

function renderExplorer() {
    try {
        const data = window.LUMI_DATA;
        const selector = document.querySelector('.p-select[data-target="explorer"]');
        if (!selector) return;
        const projectId = selector.value;
        const project = data.projects[projectId];
        
        const treeContainer = document.getElementById('file-tree');
        if (!treeContainer) return;
        treeContainer.innerHTML = '';

        if (!project || !project.files) return;

        project.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `<i>📄</i> ${file.rel_path}`;
            item.onclick = () => {
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                previewFile(file);
            };
            treeContainer.appendChild(item);
        });
    } catch (e) {
        console.error("Explorer render error:", e);
    }
}

function previewFile(file) {
    document.getElementById('viewer-filename').textContent = file.rel_path;
    const contentEl = document.getElementById('viewer-content');
    
    if (file.name.endsWith('.md')) {
        contentEl.className = 'markdown-body';
        contentEl.innerHTML = marked.parse(file.content || '');
    } else {
        contentEl.className = '';
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = file.content || '[Empty or Binary File]';
        pre.appendChild(code);
        contentEl.innerHTML = '';
        contentEl.appendChild(pre);
    }
}

function renderDialogue() {
    try {
        const data = window.LUMI_DATA;
        const container = document.getElementById('chat-messages');
        if (!container) return;
        container.innerHTML = '';

        if (!data.dialogue || data.dialogue.length === 0) {
            container.innerHTML = '<div class="placeholder-text" style="padding: 2rem; color: var(--text-dim); text-align: center;">尚無通訊記錄</div>';
            return;
        }

        data.dialogue.forEach(msg => {
            const div = document.createElement('div');
            div.className = `message ${msg.role}`;
            
            let timeStr = "Unknown Time";
            try {
                timeStr = new Date(msg.timestamp).toLocaleTimeString();
            } catch (e) {}

            div.innerHTML = `
                <div class="meta">${msg.role === 'user' ? 'Sho' : 'Lumi'} • ${timeStr}</div>
                <div class="content">${msg.content}</div>
            `;
            container.appendChild(div);
        });

        container.scrollTop = container.scrollHeight;
    } catch (e) {
        console.error("Dialogue render error:", e);
    }
}

function renderAutomation() {
    try {
        const data = window.LUMI_DATA;
        const container = document.getElementById('cron-list');
        if (!container) return;
        container.innerHTML = '';

        if (!data.cron_jobs || data.cron_jobs.length === 0) {
            container.innerHTML = '<div class="placeholder-text">尚無自動化任務</div>';
            return;
        }

        data.cron_jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = `cron-card ${job.state?.lastStatus === 'error' ? 'error' : ''}`;
            
            const nextRun = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString() : 'N/A';
            const lastRun = job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toLocaleString() : 'Never';
            
            card.innerHTML = `
                <div class="cron-header">
                    <div class="cron-name">${job.name || 'Unnamed Job'}</div>
                    <span class="cron-status ${job.state?.lastStatus || ''}">${job.state?.lastStatus || 'IDLE'}</span>
                </div>
                <div class="cron-schedule">🕒 Schedule: ${job.schedule.expr} (${job.schedule.tz})</div>
                <div class="cron-next">Next Run: ${nextRun}</div>
                <div class="cron-meta" style="font-size: 0.8rem; color: var(--text-dim);">
                    Last Run: ${lastRun}<br>
                    Agent: <code>${job.agentId}</code>
                </div>
                ${job.state?.lastError ? `<div class="cron-log">Error: ${job.state.lastError}</div>` : ''}
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error("Automation render error:", e);
    }
}
