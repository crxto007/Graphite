const fs = require('fs');
const path = require('path');

function registerFileRoutes(app) {
  // GET /file?path= - read file content
  app.get('/file', (req, res) => {
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

      // Check if file is too large (> 300KB)
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

  // POST /file - write file content
  app.post('/file', (req, res) => {
    const { path: filePath, content } = req.body;
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Path and content are required' });
    }

    try {
      const absolutePath = path.resolve(filePath);
      // Ensure directory exists
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
}

module.exports = { registerFileRoutes };