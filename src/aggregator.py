import os
import json
from datetime import datetime

class Aggregator:
    def __init__(self, workspace_root):
        self.workspace_root = workspace_root
        # Removed restricted projects_dir
        self.global_state_path = os.path.join(self.workspace_root, "projects/agent-pm-system/data/global_state.json")

    def scan_workspace(self, max_depth=3):
        """
        Scans the entire workspace to identify projects based on markers.
        """
        projects = {}
        self._recursive_scan(self.workspace_root, 0, max_depth, projects)
        return projects

    def _recursive_scan(self, current_path, depth, max_depth, projects):
        if depth > max_depth:
            return

        try:
            items = os.listdir(current_path)
        except PermissionError:
            return

        # Define project markers
        markers = {".git", "AGENTS.md", "package.json", "README.md", "todo.md"}
        found_markers = markers.intersection(set(items))

        if found_markers:
            # This directory is a project
            rel_path = os.path.relpath(current_path, self.workspace_root)
            name = os.path.basename(current_path) if rel_path != "." else "workspace-root"
            projects[rel_path] = self._get_project_info(name, current_path, found_markers)
            # We continue scanning to find nested projects, but we skip some heavy dirs
        
        # Always scan subdirectories
        ignore_dirs = {".git", "node_modules", "venv", "__pycache__", ".openclaw", "data"}
        for item in items:
            item_path = os.path.join(current_path, item)
            if os.path.isdir(item_path) and item not in ignore_dirs:
                self._recursive_scan(item_path, depth + 1, max_depth, projects)

    def _get_project_info(self, name, path, markers):
        info = {
            "name": name,
            "path": path,
            "rel_path": os.path.relpath(path, self.workspace_root),
            "markers": list(markers),
            "has_readme": "README.md" in markers,
            "has_todo": "todo.md" in markers,
            "has_agents_info": "AGENTS.md" in markers,
            "last_updated": datetime.fromtimestamp(os.path.getmtime(path)).isoformat(),
            "status": "active" if "todo.md" in markers else "stable",
            "tasks": [],
            "files": self._scan_files(path)
        }
        
        # Parse todo.md for Kanban
        todo_path = os.path.join(path, "todo.md")
        if os.path.exists(todo_path):
            info["tasks"] = self._parse_tasks(todo_path)
            done_count = sum(1 for t in info["tasks"] if t["status"] == "done")
            total_count = len(info["tasks"])
            if total_count > 0:
                info["progress"] = f"{done_count}/{total_count}"
        
        return info

    def _scan_files(self, project_path):
        file_tree = []
        ignore_dirs = {".git", "node_modules", "venv", "__pycache__", ".openclaw"}
        allow_exts = {".md", ".py", ".js", ".json", ".css", ".html", ".txt", ".sh", ".yml", ".yaml"}
        
        for root, dirs, files in os.walk(project_path):
            # Prune ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in allow_exts:
                    file_path = os.path.join(root, file)
                    rel_file_path = os.path.relpath(file_path, project_path)
                    
                    # For preview, we only store content of small files to avoid bloating data.js
                    content = ""
                    if os.path.getsize(file_path) < 50000: # 50KB limit
                        try:
                            with open(file_path, 'r', errors='ignore') as f:
                                content = f.read()
                        except:
                            content = "[Error reading file]"
                    
                    file_tree.append({
                        "name": file,
                        "rel_path": rel_file_path,
                        "ext": ext,
                        "content": content
                    })
        return file_tree

    def _parse_tasks(self, todo_path):
        tasks = []
        current_phase = "General"
        try:
            with open(todo_path, 'r', errors='ignore') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("## "):
                        current_phase = line.replace("## ", "").strip()
                    elif line.startswith("- ["):
                        status = "done" if "[x]" in line.lower() else "todo"
                        # Simple heuristic for "in_progress" if mentioned in text or last updated?
                        # For now, strictly todo/done based on markdown
                        title = line[6:].strip()
                        tasks.append({
                            "title": title,
                            "status": status,
                            "phase": current_phase
                        })
        except:
            pass
        return tasks
        
        # Try to infer status from todo.md if it exists
        todo_path = os.path.join(path, "todo.md")
        if os.path.exists(todo_path):
            with open(todo_path, 'r', errors='ignore') as f:
                content = f.read()
                done_count = content.count("[x]")
                total_count = content.count("[ ]") + done_count
                if total_count > 0:
                    info["progress"] = f"{done_count}/{total_count}"
                    info["status"] = "active" if done_count < total_count else "completed"

        return info

    def save_global_state(self, projects):
        # Load dialogue
        dialogue = []
        dialogue_path = os.path.join(self.workspace_root, "projects/agent-pm-system/data/dialogue.jsonl")
        if os.path.exists(dialogue_path):
            with open(dialogue_path, 'r') as f:
                for line in f:
                    try:
                        dialogue.append(json.loads(line))
                    except:
                        pass
        
        # Load Cron Jobs (System Automation)
        cron_jobs = []
        try:
            import subprocess
            # Use openclaw CLI to get cron list in JSON
            result = subprocess.run(["openclaw", "cron", "list", "--json"], capture_output=True, text=True)
            if result.returncode == 0:
                cron_jobs = json.loads(result.stdout).get("jobs", [])
        except:
            pass

        # Check thinking state
        is_thinking = False
        thinking_path = os.path.join(self.workspace_root, "projects/agent-pm-system/data/thinking.lock")
        if os.path.exists(thinking_path):
            is_thinking = True

        data = {
            "last_scan": datetime.now().isoformat(),
            "projects_count": len(projects),
            "is_thinking": is_thinking,
            "dialogue": dialogue,
            "cron_jobs": cron_jobs,
            "projects": projects
        }
        # Save JSON
        with open(self.global_state_path, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Save as JS for web injection
        js_data_path = os.path.join(self.workspace_root, "projects/agent-pm-system/web/data.js")
        with open(js_data_path, 'w') as f:
            f.write(f"window.LUMI_DATA = {json.dumps(data, indent=2, ensure_ascii=False)};")
            
        return self.global_state_path

if __name__ == "__main__":
    # Adjust workspace_root as needed
    workspace_root = "/Users/showang/.openclaw/workspace"
    aggregator = Aggregator(workspace_root)
    print(f"Lumi is performing full workspace illumination at: {workspace_root}")
    projects = aggregator.scan_workspace()
    state_file = aggregator.save_global_state(projects)
    print(f"Lumi has illuminated {len(projects)} projects across the workspace. Global state saved to: {state_file}")
