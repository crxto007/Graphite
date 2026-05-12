const fs = require('fs');
const path = require('path');

// Test the path resolution logic
const projectRoot = path.join(__dirname, '..');
const filePath = 'backend/test-watch/test.js';
const importPath = './utils/hash.js';

console.log('Project root:', projectRoot);
console.log('File path:', filePath);

const absolutePath = path.isAbsolute(filePath)
  ? filePath
  : path.join(projectRoot, filePath);

console.log('Absolute path:', absolutePath);

const fileDir = path.dirname(absolutePath);
console.log('File directory:', fileDir);

let resolvedPath = path.isAbsolute(importPath)
  ? importPath
  : path.join(fileDir, importPath);

console.log('Resolved path (before extension check):', resolvedPath);

// Try common extensions
const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];
for (const ext of extensions) {
  const testPath = resolvedPath + ext;
  if (fs.existsSync(testPath)) {
    console.log(`Found file with extension ${ext}:`, testPath);
    resolvedPath = testPath;
    break;
  }
}

// Try as directory with index file
const indexPath = path.join(resolvedPath, 'index.js');
if (fs.existsSync(indexPath)) {
  console.log('Found index.js:', indexPath);
  resolvedPath = indexPath;
}

console.log('Final resolved path:', resolvedPath);
const relativePath = path.relative(projectRoot, resolvedPath);
console.log('Relative to project root:', relativePath);

// Also test what we actually have
console.log('\n--- Actual file existence checks ---');
console.log('Does test.js exist?', fs.existsSync(path.join(projectRoot, 'backend/test-watch/test.js')));
console.log('Does utils/hash.js exist?', fs.existsSync(path.join(projectRoot, 'backend/test-watch/utils/hash.js')));
console.log('Does backend/test-watch/utils/hash.js exist?', fs.existsSync(path.join(projectRoot, 'backend/test-watch/utils/hash.js')));