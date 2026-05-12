const fs = require('fs');
const path = require('path');
const TreeSitter = require('web-tree-sitter');

// Initialize Tree-sitter WASM once
let parser;
let javascriptLanguage;
let typescriptLanguage;
let pythonLanguage;
let projectRoot;

// Initialize the parser
async function initParser() {
  if (!parser) {
    try {
      // Initialize the web-sitter module first
      await TreeSitter.Parser.init();

      // Set project root to two levels up from backend/ (project root)
      projectRoot = path.join(__dirname, '..');

      // Load language grammars
      await loadLanguageGrammars();

      console.log('Tree-sitter parser initialized');
    } catch (error) {
      console.error('Failed to initialize Tree-sitter parser:', error);
      throw error;
    }
  }
}

async function loadLanguageGrammars() {
  try {
    // Load JavaScript grammar
    const jsWasmPath = path.join(__dirname, '..', 'node_modules', 'tree-sitter-javascript', 'tree-sitter-javascript.wasm');
    javascriptLanguage = await TreeSitter.Language.load(jsWasmPath);

    // Load TypeScript grammar
    const tsWasmPath = path.join(__dirname, '..', 'node_modules', 'tree-sitter-typescript', 'tree-sitter-typescript.wasm');
    typescriptLanguage = await TreeSitter.Language.load(tsWasmPath);

    // Load Python grammar
    const pyWasmPath = path.join(__dirname, '..', 'node_modules', 'tree-sitter-python', 'tree-sitter-python.wasm');
    pythonLanguage = await TreeSitter.Language.load(pyWasmPath);

    // Create parser with JavaScript as default (can be changed per file)
    parser = new TreeSitter.Parser();
    parser.setLanguage(javascriptLanguage);
  } catch (error) {
    console.error('Failed to load language grammars:', error);
    // Try to load just JavaScript as fallback
    try {
      const jsWasmPath = path.join(__dirname, '..', 'node_modules', 'tree-sitter-javascript', 'tree-sitter-javascript.wasm');
      javascriptLanguage = await TreeSitter.Language.load(jsWasmPath);
      parser = new TreeSitter.Parser();
      parser.setLanguage(javascriptLanguage);
      console.log('Loaded JavaScript grammar only as fallback');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

// Get appropriate language based on file extension
function getLanguageForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.ts' || ext === '.tsx') {
    return typescriptLanguage;
  } else if (ext === '.py') {
    return pythonLanguage;
  } else {
    // Default to JavaScript for .js, .jsx, and unknown extensions
    return javascriptLanguage;
  }
}

// Parse a file and extract exports and imports
async function parseFile(filePath) {
  await initParser();

  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(projectRoot, filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`File does not exist: ${absolutePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf8');

    // Skip very large files (>500KB as per requirements)
    if (fileContent.length > 500 * 1024) {
      console.warn(`Skipping large file (>500KB): ${filePath}`);
      return null;
    }

    // Skip binary files, images, JSON config files, lock files
    const filePathLower = filePath.toLowerCase();
    if (filePathLower.endsWith('.png') || filePathLower.endsWith('.jpg') ||
        filePathLower.endsWith('.jpeg') || filePathLower.endsWith('.gif') ||
        filePathLower.endsWith('.svg') || filePathLower.endsWith('.ico') ||
        filePathLower.endsWith('.json') && (filePathLower.endsWith('.lock.json') ||
                                        filePathLower.includes('package-lock') ||
                                        filePathLower.includes('yarn-lock')) ||
        filePathLower.endsWith('.lock')) {
      console.warn(`Skipping binary/config file: ${filePath}`);
      return null;
    }

    // Set the appropriate language for this file
    const language = getLanguageForFile(filePath);
    parser.setLanguage(language);

    const tree = parser.parse(fileContent);
    const rootNode = tree.rootNode;

    // Extract imports and exports
    const imports = [];
    const exports = [];

    // Traverse the AST to find import and export statements
    function traverse(node) {
      if (node.type === 'import_statement') {
        // Extract the imported module path
        const importClause = node.childForFieldName('source');
        if (importClause) {
          let importPath = fileContent.slice(
            importClause.startIndex,
            importClause.endIndex
          ).replace(/['"]/g, ''); // Remove quotes

          // Resolve to project-relative path
          const fileDir = path.dirname(absolutePath); // Use absolutePath, not filePath
          const resolvedPath = resolveModulePath(importPath, fileDir);
          if (resolvedPath) {
            imports.push(resolvedPath);
          }
        }
      } else if (node.type === 'export_statement' ||
                 node.type === 'export_default_declaration' ||
                 node.type === 'export_named_declaration') {
        // Handle export from statements
        const sourceClause = node.childForFieldName('source');
        if (sourceClause) {
          let exportPath = fileContent.slice(
            sourceClause.startIndex,
            sourceClause.endIndex
          ).replace(/['"]/g, '');

          // Resolve to project-relative path
          const fileDir = path.dirname(absolutePath); // Use absolutePath, not filePath
          const resolvedPath = resolveModulePath(exportPath, fileDir);
          if (resolvedPath) {
            exports.push(resolvedPath);
          }
        } else {
          // Handle named exports like: export const x = 1; or export function foo() {}
          // We need to get the declarators
          const declaration = node.childForFieldName('declaration');
          if (declaration) {
            // Extract variable/function names from declaration
            extractExportNames(declaration, fileContent, exports);
          }
        }
      }

      // Also check for CommonJS exports (module.exports = ... or exports.xxx = ...)
      if (node.type === 'assignment_expression') {
        const left = node.childForFieldName('left');
        if (left) {
          const leftText = fileContent.slice(left.startIndex, left.endIndex);
          if (leftText.includes('module.exports') || leftText.includes('exports.')) {
            // Mark that we have CommonJS exports
            exports.push('module.exports');
          }
        }
      }

      // Continue traversing children
      for (let i = 0; i < node.childCount; i++) {
        traverse(node.children[i]);
      }
    }

    traverse(rootNode);

    // Also detect CommonJS style exports at the end
    if (fileContent.includes('module.exports =') ||
        fileContent.includes('exports.')) {
      // Add a generic export marker if we found CommonJS exports but didn't catch them above
      if (exports.length === 0 || !exports.includes('module.exports')) {
        exports.push('module.exports');
      }
    }

    // Determine file type and label
    const fileName = path.basename(filePath);
    const label = fileName;

    // Infer node type from file path and name
    let type = 'module';
    if (filePathLower.includes('routes/') || filePathLower.includes('api/')) {
      type = 'api';
    } else if (filePathLower.includes('db/') || filePathLower.includes('database') || fileName.includes('.db')) {
      type = 'database';
    } else if (filePathLower.includes('components/') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      type = 'component';
    } else if (filePathLower.includes('services/')) {
      type = 'service';
    } else if (filePathLower.includes('utils/') || filePathLower.includes('helpers/')) {
      type = 'utility';
    }

    // Convert to project-relative ID and filePath
    const relativeFilePath = path.relative(projectRoot, absolutePath);

    return {
      id: relativeFilePath,
      label: label,
      type: type,
      filePath: relativeFilePath,
      exports: [...new Set(exports.filter(Boolean))], // Remove duplicates and falsy values
      imports: [...new Set(imports.filter(Boolean))]  // Remove duplicates and falsy values
    };
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message);
    // Return a basic node even if parsing fails, so the file still appears in the graph
    try {
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(projectRoot, filePath);
      const fileName = path.basename(filePath);
      const relativeFilePath = path.relative(projectRoot, absolutePath);

      // Infer node type from file path and name
      let type = 'module';
      const filePathLower = filePath.toLowerCase();
      if (filePathLower.includes('routes/') || filePathLower.includes('api/')) {
        type = 'api';
      } else if (filePathLower.includes('db/') || filePathLower.includes('database') || fileName.includes('.db')) {
        type = 'database';
      } else if (filePathLower.includes('components/') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
        type = 'component';
      } else if (filePathLower.includes('services/')) {
        type = 'service';
      } else if (filePathLower.includes('utils/') || filePathLower.includes('helpers/')) {
        type = 'utility';
      }

      return {
        id: relativeFilePath,
        label: fileName,
        type: type,
        filePath: relativeFilePath,
        exports: [],
        imports: []
      };
    } catch (fallbackError) {
      console.error('Failed to create fallback node:', fallbackError);
      return null;
    }
  }
}

// Helper function to extract export names from declarations
function extractExportNames(declNode, fileContent, exportsList) {
  if (declNode.type === 'variable_declaration') {
    // Handle: export const x = 1;
    // or: export let [a, b] = [1, 2];
    const declarators = declNode.namedChildren.filter(child => child.type === 'variable_declarator');
    declarators.forEach(declarator => {
      const nameNode = declarator.childForFieldName('name');
      if (nameNode) {
        const name = getNodeText(nameNode, fileContent);
        exportsList.push(name);
      }
    });
  } else if (declNode.type === 'function_declaration') {
    // Handle: export function foo() {}
    const nameNode = declNode.childForFieldName('name');
    if (nameNode) {
      const name = getNodeText(nameNode, fileContent);
      exportsList.push(name);
    }
  } else if (declNode.type === 'class_declaration') {
    // Handle: export class MyClass {}
    const nameNode = declNode.childForFieldName('name');
    if (nameNode) {
      const name = getNodeText(nameNode, fileContent);
      exportsList.push(name);
    }
  }
}

// Helper function to get text from a node
function getNodeText(node, fileContent) {
  return fileContent.slice(node.startIndex, node.endIndex);
}

// Resolve a module path to a project-relative path
function resolveModulePath(importPath, fileDir) {
  // Skip node_modules and built-in modules
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null; // External module like 'express', 'fs', etc.
  }

  // Handle relative paths
  let resolvedPath = path.isAbsolute(importPath)
    ? importPath
    : path.join(fileDir, importPath);

  // Try common extensions
  const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json'];
  for (const ext of extensions) {
    const testPath = resolvedPath + ext;
    if (fs.existsSync(testPath)) {
      // Return path relative to project root
      return path.relative(projectRoot, testPath);
    }
  }

  // Try as directory with index file
  const indexPath = path.join(resolvedPath, 'index.js');
  if (fs.existsSync(indexPath)) {
    return path.relative(projectRoot, indexPath);
  }

  // If no extension works, return as-is (relative to project root)
  return path.relative(projectRoot, resolvedPath);
}

module.exports = { parseFile, initParser };