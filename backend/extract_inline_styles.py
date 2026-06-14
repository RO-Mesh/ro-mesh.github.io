import os
import re

DIR = '/home/stefan/Documents/Projects/RO-MESH/frontend/public'
STYLE_CSS = os.path.join(DIR, 'css', 'style.css')
PROTOCOL_CSS = os.path.join(DIR, 'css', 'protocol.css')

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Global replacements
REPLACEMENTS = [
    (r'style="display:inline-block; vertical-align:middle; margin-right:8px;"', r'class="svg-inline"'),
    (r'style="padding-top: var\(--nav-height\);"', r'class="pt-nav"'),
    (r'style="padding-block: var\(--space-12\);"', r'class="py-12"'),
    (r'style="border-color: var\(--color-accent\); background: linear-gradient\(180deg, rgba\(45, 198, 83, 0.05\) 0%, transparent 100%\);"', r'class="bg-gradient-accent"'),
    (r'style="margin-top: auto; padding-top: 2rem;"', r'class="mt-auto pt-8"'),
    (r'style="margin-top:1.5rem;"', r'class="mt-6"'),
    (r'style="margin-top:0.6rem;"', r'class="mt-2"'),
    (r'style="font-size:clamp\(1\.5rem,3vw,2rem\); font-weight:700; color:var\(--color-text-primary\); margin:0 0 2\.5rem; line-height:1\.2;"', r'class="heading-lg mb-10"'),
    (r'style="font-size: clamp\(1\.5rem,3vw,2rem\); font-weight:700; color:var\(--color-text-primary\); margin:0 0 2\.5rem; line-height:1\.2;"', r'class="heading-lg mb-10"'),
    (r'style="font-size:clamp\(1\.5rem,3vw,2rem\); font-weight:700; color:var\(--color-text-primary\); margin:0 0 0\.75rem; line-height:1\.2;"', r'class="heading-lg mb-3"'),
    (r'style="font-size:clamp\(1\.5rem,3vw,2rem\); font-weight:700; color:var\(--color-text-primary\); margin:0 0 3rem; line-height:1\.2;"', r'class="heading-lg mb-12"'),
    (r'style="font-size:1rem; color:var\(--color-text-secondary\); line-height:1\.7; max-width:60ch; margin:0 0 2\.5rem;"', r'class="text-secondary max-w-60 mb-10"'),
    (r'style="font-size:1rem; color:var\(--color-text-secondary\); line-height:1\.75; max-width:68ch; margin:0 0 2\.5rem;"', r'class="text-secondary max-w-68 mb-10"')
]

# We must merge existing classes with the new ones where the element already has a class attribute.
# E.g. <main style="padding-top: var(--nav-height);"> -> <main class="pt-nav">
# But if it's <section class="container" style="...">, replacing it with class="py-12" directly will result in class="container" class="py-12". This is invalid HTML.
# We should intelligently merge them. 
# Better regex: find class="something" style="..." and merge.
# Since it's complex, I will do it differently: read html, find `style="..."`.
# We parse the file with regex. Find all tags with `style="..."`.

def replace_inline_styles(html):
    def replacer(match):
        tag_start = match.group(0)
        # Check if style matches any in REPLACEMENTS
        for style_str, class_str in REPLACEMENTS:
            if style_str in tag_start:
                # We found a match!
                # Extract the class names from class_str
                new_classes = re.search(r'class="(.*?)"', class_str).group(1)
                
                # Remove the style attribute
                tag_start = tag_start.replace(' ' + style_str, '')
                
                # Does the tag already have a class?
                if 'class="' in tag_start:
                    # Append the new classes
                    tag_start = re.sub(r'class="(.*?)"', rf'class="\1 {new_classes}"', tag_start)
                else:
                    # Add the new class attribute
                    tag_start = tag_start.replace('>', f' class="{new_classes}">')
                    tag_start = tag_start.replace(' />', f' class="{new_classes}" />') # For self closing
        return tag_start

    # Regex to match any HTML tag with a style attribute
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

# Now we append the new classes to style.css
utility_classes = """
/* ── Extracted Inline Utility Classes ─────────────────────────────────────── */
.svg-inline { display:inline-block; vertical-align:middle; margin-right:8px; }
.pt-nav { padding-top: var(--nav-height); }
.py-12 { padding-block: var(--space-12); }
.bg-gradient-accent { border-color: var(--color-accent); background: linear-gradient(180deg, rgba(45, 198, 83, 0.05) 0%, transparent 100%); }
.mt-auto { margin-top: auto; }
.pt-8 { padding-top: 2rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-2 { margin-top: 0.6rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-12 { margin-bottom: 3rem; }
.heading-lg { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; color: var(--color-text-primary); line-height: 1.2; }
.text-secondary { font-size: 1rem; color: var(--color-text-secondary); line-height: 1.7; }
.max-w-60 { max-width: 60ch; }
.max-w-68 { max-width: 68ch; line-height: 1.75; }
"""

style_content = read_file(STYLE_CSS)
if ".svg-inline" not in style_content:
    write_file(STYLE_CSS, style_content + utility_classes)
    print("Added utility classes to style.css")
