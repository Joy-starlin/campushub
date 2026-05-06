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

const appDir = path.join(__dirname, 'app');
const files = walk(appDir);
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  const usesResponsiveButton = /<ResponsiveButton/.test(content);
  const importsResponsiveButton = /import\s+.*ResponsiveButton.*/.test(content);
  
  // 1. Fix existing imports
  if (importsResponsiveButton) {
      const fixedContent = content.replace(/import\s+(?:\{[^}]*\}|ResponsiveButton)\s+from\s+(['"])([^'"]+)\1/g, (match, quote, p1) => {
          if (p1.includes('ResponsiveButton')) {
              let newPath = p1.replace('ResponsiveButton', 'ResponsiveForm');
              changed = true;
              return `import { ResponsiveButton } from '${newPath}'`;
          }
          return match;
      });
      content = fixedContent;
  }
  
  // 2. Add missing imports if used
  if (usesResponsiveButton && !/import\s+.*ResponsiveButton.*/.test(content)) {
      // Find a good place to insert - after 'use client' or other imports
      let lines = content.split('\n');
      let insertIndex = 0;
      if (lines[0].includes('use client')) {
          insertIndex = 1;
      }
      
      // Determine relative path to components
      const relativePathToApp = path.relative(path.dirname(file), appDir);
      let importPath = '';
      if (file.includes(path.join('app', 'components'))) {
          // It's already in components
          importPath = './ResponsiveForm';
      } else {
          importPath = path.join(relativePathToApp, 'components', 'ResponsiveForm').replace(/\\/g, '/');
          if (!importPath.startsWith('.')) {
              importPath = './' + importPath;
          }
      }
      
      lines.splice(insertIndex, 0, `import { ResponsiveButton } from '${importPath}'`);
      content = lines.join('\n');
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files with ResponsiveButton fixes.`);
