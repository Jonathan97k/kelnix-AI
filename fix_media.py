import os

file_path = r'D:\AI TRADER\Reel maker\src\pages\Media.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix escaped quotes in JSX attributes
content = content.replace('\\"', '"')

# Fix corrupted closing tags: </tag} -> </tag>
import re
content = re.sub(r'</([a-zA-Z0-9]+)\}', r'</\1>', content)

# Special cases if any
# content = content.replace('</div}', '</div>') # handled by regex

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully fixed {file_path}")
