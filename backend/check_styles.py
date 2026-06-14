import hashlib

files = [
    '/home/stefan/Documents/Projects/RO-MESH/frontend/public/meshtastic/index.html',
    '/home/stefan/Documents/Projects/RO-MESH/frontend/public/reticulum/index.html',
    '/home/stefan/Documents/Projects/RO-MESH/frontend/public/meshcore/index.html',
    '/home/stefan/Documents/Projects/RO-MESH/frontend/public/index.html'
]

import re

for f in files:
    with open(f, 'r') as fp:
        c = fp.read()
    
    match = re.search(r'<style>(.*?)</style>', c, re.DOTALL)
    if match:
        style_content = match.group(1).strip()
        h = hashlib.md5(style_content.encode('utf-8')).hexdigest()
        print(f"{f}: {len(style_content)} bytes, md5 {h}")
