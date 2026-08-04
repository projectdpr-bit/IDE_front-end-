const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/features');
let updatedFiles = [];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  let originalCode = code;

  // Pattern 1: The old header
  // <h1 className=\"... flex items-center ...\">\n  <Icon className=\"...\" />\n  Title\n</h1>\n<p ...>Subtitle</p>
  const oldHeaderRegex = /<h1[^>]*flex items-center[^>]*>\s*<([A-Z][a-zA-Z0-9]+)\s+className="[^"]*w-7 h-7[^"]*"[^>]*\/>\s*([^<]+)\s*<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/;
  
  if (oldHeaderRegex.test(code)) {
    code = code.replace(oldHeaderRegex, (match, IconName, Title, Subtitle) => {
      Title = Title.trim();
      Subtitle = Subtitle.trim();
      return `<div className="flex items-center gap-(--space-3)">
            <div className="shrink-0 w-[clamp(2rem,1.5rem+1.5vw,2.75rem)] h-[clamp(2rem,1.5rem+1.5vw,2.75rem)] rounded-lg bg-linear-to-b from-primary-top to-primary-bottom flex items-center justify-center shadow-[0_4px_12px_var(--color-primary-shadow)]">
              <${IconName} className="w-(--icon-md) h-(--icon-md) text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">${Title}</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">${Subtitle}</p>
            </div>
          </div>`;
    });
    
    // Also fix the wrapper flex layout for the old header to match new standard
    code = code.replace(/<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">/g, 
      '<div className="flex flex-wrap items-center justify-between gap-(--space-3)">');
  }

  // Pattern 2: The newly created headers that lack shrink-0, min-w-0, and truncate
  const newHeaderRegex = /<div className="w-\[clamp[^>]*flex items-center justify-center shadow-[^>]*">/g;
  code = code.replace(newHeaderRegex, match => {
    if (!match.includes('shrink-0')) {
      return match.replace('w-[clamp', 'shrink-0 w-[clamp');
    }
    return match;
  });

  const titleGroupRegex = /<div>\s*<h1 className="text-\(--text-xl\) font-bold text-slate-800 leading-tight">([^<]+)<\/h1>\s*<p className="text-\(--text-xs\) text-slate-500 mt-\(--space-1\)">([^<]+)<\/p>\s*<\/div>/g;
  code = code.replace(titleGroupRegex, (match, Title, Subtitle) => {
    return `<div className="min-w-0">
              <h1 className="text-(--text-xl) font-bold text-slate-800 leading-tight truncate">${Title}</h1>
              <p className="text-(--text-xs) text-slate-500 mt-(--space-1) truncate">${Subtitle}</p>
            </div>`;
  });
  
  if (code !== originalCode) {
    fs.writeFileSync(f, code);
    updatedFiles.push(f);
  }
});

console.log('Updated ' + updatedFiles.length + ' files:');
console.log(updatedFiles.join('\n'));
