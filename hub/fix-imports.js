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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app'));
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (/import\s+ResponsiveButton\s+from\s+['"][^'"]+['"]/.test(content)) {
    content = content.replace(/import\s+ResponsiveButton\s+from\s+(['"])([^'"]+)\1/g, (match, quote, p1) => {
      let newPath = p1;
      if (newPath.endsWith('ResponsiveButton')) {
          newPath = newPath.replace('ResponsiveButton', 'ResponsiveForm');
      }
      return `import { ResponsiveButton } from '${newPath}'`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files.`);
