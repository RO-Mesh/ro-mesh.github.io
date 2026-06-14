import os
import re

DIR = '/home/stefan/Documents/Projects/RO-MESH/frontend/public'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# We map actual string matches directly
styles_to_classes = {
    'display:inline-block; vertical-align:middle; margin-right:8px;': 'svg-inline',
    'padding-top: var(--nav-height);': 'pt-nav',
    'padding-block: var(--space-12);': 'py-12',
    'border-color: var(--color-accent); background: linear-gradient(180deg, rgba(45, 198, 83, 0.05) 0%, transparent 100%);': 'bg-gradient-accent',
    'margin-top: auto; padding-top: 2rem;': 'mt-auto pt-8',
    'margin-top:1.5rem;': 'mt-6',
    'margin-top:0.6rem;': 'mt-2',
    'font-size:clamp(1.5rem,3vw,2rem); font-weight:700; color:var(--color-text-primary); margin:0 0 2.5rem; line-height:1.2;': 'heading-lg mb-10',
    'font-size: clamp(1.5rem,3vw,2rem); font-weight:700; color:var(--color-text-primary); margin:0 0 2.5rem; line-height:1.2;': 'heading-lg mb-10',
    'font-size:clamp(1.5rem,3vw,2rem); font-weight:700; color:var(--color-text-primary); margin:0 0 0.75rem; line-height:1.2;': 'heading-lg mb-3',
    'font-size:clamp(1.5rem,3vw,2rem); font-weight:700; color:var(--color-text-primary); margin:0 0 3rem; line-height:1.2;': 'heading-lg mb-12',
    'font-size:1rem; color:var(--color-text-secondary); line-height:1.7; max-width:60ch; margin:0 0 2.5rem;': 'text-secondary max-w-60 mb-10',
    'font-size:1rem; color:var(--color-text-secondary); line-height:1.75; max-width:68ch; margin:0 0 2.5rem;': 'text-secondary max-w-68 mb-10'
}

def replace_inline_styles(html):
    def replacer(match):
        tag = match.group(0)
        # Find style attribute
        style_match = re.search(r'style="([^"]*)"', tag)
        if not style_match: return tag
        
        style_val = style_match.group(1).strip()
        
        new_classes = None
        for k, v in styles_to_classes.items():
            if k == style_val:
                new_classes = v
                break
        
        if not new_classes:
            return tag # Leave alone if not mapped
            
        # Remove style attribute completely
        tag = re.sub(r'\s*style="[^"]*"', '', tag)
        
        # Merge or add class
        if 'class="' in tag:
            tag = re.sub(r'class="([^"]*)"', rf'class="\1 {new_classes}"', tag)
        else:
            tag = tag.replace('>', f' class="{new_classes}">')
            tag = tag.replace(' />', f' class="{new_classes}" />')
            
        return tag

    return re.sub(r'<[a-zA-Z0-9]+[^>]*style="[^"]*"[^>]*>', replacer, html)

for root_dir, dirs, files in os.walk(DIR):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root_dir, f)
            html = read_file(filepath)
            new_html = replace_inline_styles(html)
            if html != new_html:
                write_file(filepath, new_html)
                print(f"Refactored {filepath}")
