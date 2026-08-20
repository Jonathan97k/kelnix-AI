import os
import re

root_dir = r'D:\AI TRADER\Reel maker'

def fix_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return False
    
    original_content = content
    
    # Fix escaped quotes in JSX attributes
    content = content.replace('\\"', '"')
    
    # Fix corrupted closing tags: </tag} -> </tag>
    content = re.sub(r'</([a-zA-Z0-9]+)\}', r'</\1>', content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

files_fixed = 0
for root, dirs, files in os.walk(root_dir):
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            file_path = os.path.join(root, file)
            if fix_file(file_path):
                files_fixed += 1
                print(f"Fixed: {file_path}")

print(f"Total files fixed: {files_fixed}")
