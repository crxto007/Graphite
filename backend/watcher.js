const chokidar = require('chokidar');
const path = require('path');
const { parseFile } = require('./parser');
const { broadcastMessage } = require('./index');

/**
 * Creates a file watcher for the specified folder
 * @param {string} folderPath - The folder to watch (relative to project root)
 * @param {Function} callback - Function to call on file changes: callback(eventType, filePath)
 * @returns {Object} - The watcher instance with a close() method
 */
function createWatcher(folderPath, callback) {
  const absolutePath = path.isAbsolute(folderPath)
    ? folderPath
    : path.join(__dirname, '..', folderPath);

  console.log(`Watching folder: ${absolutePath}`);

  const watcher = chokidar.watch(absolutePath, {
    ignored: /(^|[\/\\])\.(git|node_modules|dist|build|env)/, // ignore dotfiles and common folders
    persistent: true,
    ignoreInitial: true
  });

  const logAndCallback = (eventType, filePath) => {
    // Make path relative to project root for consistency
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`${eventType}: ${relativePath}`);
    callback(eventType, relativePath);

    // When a file is created or changed, parse it and broadcast the update
    if (eventType === 'Created' || eventType === 'Changed') {
      parseFile(filePath)
        .then((result) => {
          if (result) {
            // Create node descriptor
            const nodeDescriptor = {
              id: result.id,
              label: result.label,
              type: result.type,
              filePath: result.filePath,
              exports: result.exports,
              imports: result.imports
            };

            // Create edge descriptors from imports
            const edgeDescriptors = result.imports.map(imp => ({
              from: result.id,
              to: imp,
              label: 'imports'
            }));

            // Create the graph update message
            const graphUpdateMessage = {
              type: 'graph_update',
              nodes: [nodeDescriptor],
              edges: edgeDescriptors
            };

            // Broadcast to all connected clients
            broadcastMessage(graphUpdateMessage);
            console.log(`Broadcasted graph update for ${filePath}`);
          }
        })
        .catch((error) => {
          console.error(`Error processing file ${filePath}:`, error);
        });
    }

    // When a file is deleted, broadcast a removal message
    if (eventType === 'Deleted') {
      const deleteMessage = {
        type: 'graph_update',
        nodes: [], // Empty nodes array
        edges: [], // Empty edges array
        deletedNodeId: filePath // Include the ID of the deleted node
      };

      broadcastMessage(deleteMessage);
      console.log(`Broadcasted deletion for ${filePath}`);
    }
  };

  watcher
    .on('add', (filePath) => logAndCallback('Created', filePath))
    .on('change', (filePath) => logAndCallback('Changed', filePath))
    .on('unlink', (filePath) => logAndCallback('Deleted', filePath))
    .on('error', (error) => console.error('Watcher error:', error));

  // Optional: log when ready
  watcher.on('ready', () => console.log('Watcher ready. Initial scan complete.'));

  return {
    close: () => watcher.close()
  };
}

module.exports = { createWatcher };