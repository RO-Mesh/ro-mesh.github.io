const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const dir = path.join(__dirname, '../frontend/public');

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });
  let modified = false;

  function walk(node, inTarget) {
    if (node.type === 'text') {
      if (inTarget) {
        const original = node.data;
        const regex = /\b(LoRa|ESP|NRF)\b/gi;
        if (regex.test(original)) {
          const newHtml = original.replace(regex, (match) => {
            const term = match.toLowerCase();
            return `<span class="glossary-term" data-term="${term}">${match}</span>`;
          });
          $(node).replaceWith(newHtml);
          modified = true;
        }
      }
    } else if (node.type === 'tag') {
      const skipTags = ['a', 'script', 'style', 'code', 'title'];
      if (skipTags.includes(node.name)) return;
      if (node.name === 'span' && $(node).hasClass('glossary-term')) return;
      
      let isTarget = inTarget;
      if (!isTarget) {
        if (node.name === 'p' || node.name === 'li') isTarget = true;
        const className = $(node).attr('class') || '';
        if (className.includes('card')) isTarget = true;
      }
      
      const children = $(node).contents().toArray();
      for (const child of children) {
        walk(child, isTarget);
      }
    }
  }

  const root = $.root().contents().toArray();
  for (const child of root) {
    walk(child, false);
  }

  if (modified) {
    fs.writeFileSync(filePath, $.html(), 'utf8');
    console.log(`Modified ${filePath}`);
  }
}

function walkDir(d) {
  const files = fs.readdirSync(d);
  for (const file of files) {
    const fullPath = path.join(d, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.html')) {
      processHtmlFile(fullPath);
    }
  }
}

walkDir(dir);
