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
  
  if (!content.includes('useApiRefreshStore')) return; // Only process files we already touched

  let originalContent = content;

  // Clean up the bad injected line
  content = content.replace(/\n\s*const refreshKey = useApiRefreshStore\(\(state\) => state\.refreshKey\);/g, '');
  
  // Inject properly into React components (starting with capital letter)
  content = content.replace(/(export default function [A-Z]\w*\s*\(.*?\)\s*{|const [A-Z]\w*\s*=\s*\(.*?\)\s*=>\s*{)/g, `$1\n  const refreshKey = useApiRefreshStore((state) => state.refreshKey);`);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    modifiedCount++;
    console.log(`Fixed: ${filePath}`);
  }
});

console.log(`Successfully fixed ${modifiedCount} files.`);
