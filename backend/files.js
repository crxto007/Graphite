const fs = require('fs');
const path = require('path');

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
}

module.exports = { registerFileRoutes };
