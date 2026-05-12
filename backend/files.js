const fs = require('fs');
const path = require('path');
const { parseFile } = require('./parser');

function registerFileRoutes(app) {
  // GET /api/file?path= - read file content
  app.get('/api/file', (req, res) => {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    try {
      const absolutePath = path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      const stats = fs.statSync(absolutePath);
      const fileSize = stats.size;

      if (fileSize > 300 * 1024) {
        return res.status(413).json({
          error: 'File too large to preview',
          message: 'File too large to preview — open in external editor',
          path: filePath
        });
      }

      const content = fs.readFileSync(absolutePath, 'utf8');
      res.json({ content, size: fileSize });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/file - write file content
  app.post('/api/file', (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Path and content are required' });
    }

    try {
      const absolutePath = path.resolve(filePath);
      const dir = path.dirname(absolutePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(absolutePath, content, 'utf8');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/graph/load - load saved canvas state
  app.get('/api/graph/load', (req, res) => {
    const savePath = path.resolve('project.graph.json');
    try {
      if (!fs.existsSync(savePath)) {
        return res.json({ nodes: [], edges: [], files: {}, selectedFilePath: null });
      }
      const data = fs.readFileSync(savePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/graph/save - save canvas state
  app.post('/api/graph/save', (req, res) => {
    const savePath = path.resolve('project.graph.json');
    try {
      fs.writeFileSync(savePath, JSON.stringify(req.body, null, 2), 'utf8');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/scan?path=<folder> - scan an entire folder for graph data
  app.get('/api/scan', async (req, res) => {
    const folderPath = req.query.path;
    if (!folderPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    try {
      const absolutePath = path.resolve(folderPath);
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      const stats = fs.statSync(absolutePath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }

      // Walk the directory and collect all files
      const filesToScan = [];
      const walkDir = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          // Skip ignored directories and files
          if (entry.name.startsWith('.') ||
              entry.name === 'node_modules' ||
              entry.name === 'dist' ||
              entry.name === 'build' ||
              entry.name === '.git') {
            continue;
          }

          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else {
            // Check file size and extension
            const fileSize = fs.statSync(fullPath).size;
            if (fileSize <= 500 * 1024) { // 500KB limit
              const ext = path.extname(entry.name).toLowerCase();
              if (['.js', '.ts', '.jsx', '.tsx', '.py'].includes(ext) ||
                  !['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json'].includes(ext)) {
                filesToScan.push(fullPath);
              }
            }
          }
        }
      };

      walkDir(absolutePath);

      // Parse all files
      const nodes = [];
      const edges = [];

      for (const filePath of filesToScan) {
        try {
          const relativePath = path.relative(path.resolve('..'), filePath);
          const result = await parseFile(relativePath);
          if (result) {
            nodes.push({
              id: result.id,
              label: result.label,
              type: result.type,
              filePath: result.filePath,
              exports: result.exports,
              imports: result.imports
            });

            // Add edges for imports
            result.imports.forEach(imp => {
              edges.push({
                from: result.id,
                to: imp,
                label: 'imports'
              });
            });
          }
        } catch (fileError) {
          console.warn(`Error scanning file ${filePath}:`, fileError.message);
          // Continue with other files
        }
      }

      res.json({ nodes, edges, files: {} }); // files object can be empty for now
    } catch (error) {
      console.error('Error scanning folder:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { registerFileRoutes };