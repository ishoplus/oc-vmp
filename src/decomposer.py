import json
import os
import uuid
from datetime import datetime

class Decomposer:
    def __init__(self, workspace_root):
        self.workspace_root = workspace_root
        self.schema_path = os.path.join(workspace_root, "schema/task.json")
        self.data_path = os.path.join(workspace_root, "data/tasks")
        
    def load_schema(self):
        with open(self.schema_path, 'r') as f:
            return json.load(f)

    def save_task(self, task_data):
        task_id = task_data.get('id', str(uuid.uuid4())[:8])
        task_data['id'] = task_id
        task_data['status'] = task_data.get('status', 'todo')
        task_data['created_at'] = datetime.now().isoformat()
        task_data['updated_at'] = datetime.now().isoformat()
        
        file_path = os.path.join(self.data_path, f"{task_id}.json")
        with open(file_path, 'w') as f:
            json.dump(task_data, f, indent=2, ensure_ascii=False)
        return task_id

    def decompose_from_text(self, vision, raw_json_tasks):
        """
        Takes a vision statement and a list of task dicts (from Agent reasoning),
        and persists them.
        """
        tasks = json.loads(raw_json_tasks)
        created_ids = []
        for task in tasks:
            tid = self.save_task(task)
            created_ids.append(tid)
        return created_ids

if __name__ == "__main__":
    # Example usage for testing
    import sys
    
    # Simple CLI interface
    if len(sys.argv) < 2:
        print("Usage: python decomposer.py <vision_text>")
        sys.exit(1)
        
    vision = sys.argv[1]
    # For now, this is a placeholder for the logic that will be driven by the Agent's reasoning
    print(f"Decomposing vision: {vision}")
    print("Ready to receive structured tasks from the Agent brain.")
