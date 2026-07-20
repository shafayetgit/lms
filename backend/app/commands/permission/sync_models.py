import os
import json
import glob
from pathlib import Path

def sync_permission_models():
    base_dir = Path(__file__).resolve().parents[3]
    models_dir = base_dir / "models"
    perm_file = Path(__file__).parent / "data.json"

    # Extract all model names from files in the app/models directory
    models = []
    for f in glob.glob(f"{models_dir}/*.py"):
        base = os.path.basename(f)
        if base not in ["__init__.py"]: 
            models.append(base.replace(".py", ""))
            
    models = sorted(list(set(models)))
    
    # Load current permission data
    if perm_file.exists():
        with open(perm_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        print(f"Error: {perm_file} does not exist.")
        return

    added_count = 0
    
    # Sync each role with all available models
    for role_slug, perms in data.items():
        for model in models:
            if model not in perms:
                # Default logic: Admin gets all permissions, others get none
                if role_slug == "admin":
                    perms[model] = {
                        "read": True, "create": True, "update": True, 
                        "delete": True, "export": True, "import": True, 
                        "only_if_creator": False
                    }
                else:
                    perms[model] = {
                        "read": False, "create": False, "update": False, 
                        "delete": False, "export": False, "import": False, 
                        "only_if_creator": False
                    }
                added_count += 1
                print(f"Added missing model '{model}' to role '{role_slug}'")

    # Save the updated permissions back to data.json
    if added_count > 0:
        with open(perm_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        print(f"\nSuccessfully synced! Added {added_count} missing permission entries.")
    else:
        print("\nAll models are already perfectly synced in data.json!")

if __name__ == "__main__":
    sync_permission_models()
