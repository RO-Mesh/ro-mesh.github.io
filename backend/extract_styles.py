import os
import re

DIR = '/home/stefan/Documents/Projects/RO-MESH/frontend/public'
CSS_DIR = os.path.join(DIR, 'css')

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Extract <style> from offline.html
offline_path = os.path.join(DIR, 'offline.html')
offline_html = read_file(offline_path)
match = re.search(r'<style>(.*?)</style>', offline_html, re.DOTALL)
if match:
    write_file(os.path.join(CSS_DIR, 'offline.css'), match.group(1).strip() + '\n')
    offline_html = offline_html[:match.start()] + '<link rel="stylesheet" href="/css/offline.css">' + offline_html[match.end():]
    write_file(offline_path, offline_html)

# 2. Extract <style> from index.html
index_path = os.path.join(DIR, 'index.html')
index_html = read_file(index_path)
match = re.search(r'<style>(.*?)</style>', index_html, re.DOTALL)
if match:
    write_file(os.path.join(CSS_DIR, 'index.css'), match.group(1).strip() + '\n')
    index_html = index_html[:match.start()] + '<link rel="stylesheet" href="/css/index.css">' + index_html[match.end():]
    write_file(index_path, index_html)

# 3. Extract <style> from protocols (we will just take from meshtastic, as they are mostly identical, but let's append them if they differ)
# Actually, they are 12.5k - 13.3k. Let's create `protocol.css` from meshtastic, and strip <style> from all 3.
protocol_css = ""
for proto in ['meshtastic', 'reticulum', 'meshcore']:
    proto_path = os.path.join(DIR, proto, 'index.html')
    proto_html = read_file(proto_path)
    match = re.search(r'<style>(.*?)</style>', proto_html, re.DOTALL)
    if match:
        if not protocol_css:
            protocol_css = match.group(1).strip() + '\n'
        proto_html = proto_html[:match.start()] + '<link rel="stylesheet" href="/css/protocol.css">' + proto_html[match.end():]
        write_file(proto_path, proto_html)

if protocol_css:
    write_file(os.path.join(CSS_DIR, 'protocol.css'), protocol_css)

print("Style blocks extracted!")
