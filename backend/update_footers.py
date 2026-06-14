import os
import re

DIR = '/home/stefan/Documents/Projects/RO-MESH/frontend/public'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

for root_dir, dirs, files in os.walk(DIR):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root_dir, f)
            html = read_file(filepath)
            
            # The pattern looks like:
            # <li><a href="/dictionar.html">Dicționar</a></li>
            # We want to add <li><a href="/comunitati.html">Comunități</a></li> after it.
            
            target = '<li><a href="/dictionar.html">Dicționar</a></li>'
            replacement = '<li><a href="/dictionar.html">Dicționar</a></li>\n            <li><a href="/comunitati.html">Comunități</a></li>'
            
            if target in html and 'href="/comunitati.html"' not in html:
                new_html = html.replace(target, replacement)
                write_file(filepath, new_html)
                print(f"Updated footer in {filepath}")
