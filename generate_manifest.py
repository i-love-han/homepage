import os
import json

# Configuration
IMAGE_DIR = 'images'
OUTPUT_FILE = 'image_manifest.json'
VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

def generate_manifest():
    manifest = {}
    
    # Check if images directory exists
    if not os.path.exists(IMAGE_DIR):
        print(f"Directory '{IMAGE_DIR}' not found.")
        return

    # Walk through the images directory
    for root, dirs, files in os.walk(IMAGE_DIR):
        # Determine current category (subdirectory name)
        rel_path = os.path.relpath(root, IMAGE_DIR)
        
        # Skip root 'images' folder itself, only look at subfolders
        if rel_path == '.':
            continue
            
        # Normalize path separators for web (force forward slash)
        category = rel_path.replace(os.sep, '/')
        
        image_list = []
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in VALID_EXTENSIONS:
                # Store relative path from repo root
                full_path = f"images/{category}/{file}"
                image_list.append({
                    "name": file,
                    "path": full_path
                })
        
        # Add to manifest if there are images
        if image_list:
            manifest[category] = image_list

    # Write to JSON file
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        print(f"Successfully generated '{OUTPUT_FILE}'")
    except Exception as e:
        print(f"Error writing manifest: {e}")

if __name__ == "__main__":
    generate_manifest()
