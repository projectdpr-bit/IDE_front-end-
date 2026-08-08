const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedCount = 0;

walkDir('d:/Motnic/IED/src/features', (filePath) => {
  if (!filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if it doesn't have useEffect
  if (!content.includes('useEffect')) return;
  if (content.includes('useApiRefreshStore')) return;
  
  let originalContent = content;

  // Add import
  if (content.includes("import React")) {
    content = content.replace(/(import React.*?from ['"]react['"];?\n?)/, `$1import { useApiRefreshStore } from "@/store/useApiRefreshStore";\n`);
  } else {
    content = content.replace(/(import .*?from ['"].*?['"];?\n?)/, `$1import { useApiRefreshStore } from "@/store/useApiRefreshStore";\n`);
  }
  
  // Add hook inside components
  content = content.replace(/(export default function \w+\(.*?\)\s*{|const \w+ = \(.*?\)\s*=>\s*{)/, `$1\n  const refreshKey = useApiRefreshStore((state) => state.refreshKey);`);
  
  // Replace dependency arrays for hooks closing with `}, [deps])`
  content = content.replace(/},\s*\[([^\]\n]*?)\]\)/g, (match, p1) => {
    if (p1.trim() === '') {
      return `}, [refreshKey])`;
    }
    if (p1.includes('refreshKey')) {
      return match;
    }
    return `}, [${p1}, refreshKey])`;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    modifiedCount++;
    console.log(`Modified: ${filePath}`);
  }
});

console.log(`Successfully modified ${modifiedCount} files.`);
