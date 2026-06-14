import os
import re
from html.parser import HTMLParser

DIR = '/home/stefan/Documents/Projects/RO-MESH/frontend/public'

class ReplacerParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.output = []
        self.stack = []
        self.regex = re.compile(r'\b(LoRa|ESP|NRF)\b', re.IGNORECASE)
        self.modified = False

    def is_skipped(self):
        for tag, attrs in self.stack:
            if tag in ('script', 'style', 'code', 'title', 'a'):
                return True
            if tag == 'span':
                for k, v in attrs:
                    if k == 'class' and v and 'glossary-term' in v:
                        return True
        return False

    def is_target(self):
        for tag, attrs in self.stack:
            if tag in ('p', 'li'):
                return True
            for k, v in attrs:
                if k == 'class' and v and 'card' in v:
                    return True
        return False

    def handle_starttag(self, tag, attrs):
        self.stack.append((tag, attrs))
        self.output.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                self.stack = self.stack[:i]
                break
        self.output.append(f'</{tag}>')

    def handle_startendtag(self, tag, attrs):
        self.output.append(self.get_starttag_text())

    def handle_data(self, data):
        if self.is_target() and not self.is_skipped():
            new_data = self.regex.sub(lambda m: f'<span class="glossary-term" data-term="{m.group(1).lower()}">{m.group(1)}</span>', data)
            if new_data != data:
                self.modified = True
                self.output.append(new_data)
                return
        self.output.append(data)

    def handle_entityref(self, name):
        self.output.append(f'&{name};')

    def handle_charref(self, name):
        self.output.append(f'&#{name};')

    def handle_comment(self, data):
        self.output.append(f'<!--{data}-->')

    def handle_decl(self, decl):
        self.output.append(f'<!{decl}>')

    def handle_pi(self, data):
        self.output.append(f'<?{data}>')

for root_dir, dirs, files in os.walk(DIR):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root_dir, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            parser = ReplacerParser()
            parser.feed(content)
            
            if parser.modified:
                new_content = "".join(parser.output)
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Modified {filepath}")
