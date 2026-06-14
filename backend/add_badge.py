import os
import re

DIR = '/home/stefan/Documents/Projects/RO-MESH/frontend/public'

def replacer(match):
    prefix = match.group(1)
    logo_text = match.group(2)
    return f'{prefix}{logo_text} <span class="status-pill alpha">alpha</span>'

pattern = re.compile(
    r'(<header class="site-header">.*?<a href="/" class="nav-logo">.*?)(\<span class="logo-text"\>RO-\<span class="logo-accent"\>MESH\</span\>\</span\>)',
    flags=re.DOTALL
)

for root_dir, dirs, files in os.walk(DIR):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root_dir, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            new_content = pattern.sub(replacer, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Modified {filepath}")
